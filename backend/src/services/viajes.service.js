const prisma = require('../utils/prisma');

const include = {
  pasajero:  { select: { id: true, nombre: true, apellido: true, foto_perfil: true, telefono: true } },
  conductor: { select: { id: true, nombre: true, apellido: true, foto_perfil: true, telefono: true } },
  vehiculo:  true,
  ruta:      { include: { puntos_ruta: { orderBy: { orden: 'asc' } } } },
};

async function listar(filtros = {}) {
  let where = {};

  if (filtros.pasajero_id) {
    // Vista pasajero: sus propios viajes
    where.pasajero_id = parseInt(filtros.pasajero_id, 10);
    if (filtros.estado) where.estado = filtros.estado;
  } else if (filtros.conductor_id) {
    const conductorId = parseInt(filtros.conductor_id, 10);
    if (!filtros.estado) {
      // "Todos": todos los pendientes (para aceptar) + sus propios viajes
      where = {
        OR: [
          { estado: 'pendiente' },
          { conductor_id: conductorId },
        ],
      };
    } else if (filtros.estado === 'pendiente') {
      // Filtrando solo pendientes: todos los disponibles (sin conductor aún)
      where = { estado: 'pendiente' };
    } else {
      // Otro estado: solo sus propios viajes
      where = { conductor_id: conductorId, estado: filtros.estado };
    }
  } else {
    if (filtros.estado) where.estado = filtros.estado;
  }

  return prisma.viajes.findMany({ where, include, orderBy: { fecha_solicitud: 'desc' } });
}

async function obtener(id) {
  const v = await prisma.viajes.findUnique({ where: { id }, include });
  if (!v) throw { status: 404, message: 'Viaje no encontrado' };
  return v;
}

async function solicitar(pasajero_id, data) {
  const { ruta_id, precio } = data;
  return prisma.viajes.create({
    data: {
      pasajero_id,
      ruta_id: parseInt(ruta_id, 10),
      precio: precio ? parseFloat(precio) : null,
      estado: 'pendiente',
    },
    include,
  });
}

async function aceptar(id, conductor_id, vehiculo_id) {
  const v = await prisma.viajes.findUnique({ where: { id } });
  if (!v) throw { status: 404, message: 'Viaje no encontrado' };
  if (v.estado !== 'pendiente') throw { status: 409, message: 'El viaje no está pendiente' };
  if (v.pasajero_id === conductor_id) throw { status: 400, message: 'No puedes conducir tu propio viaje' };

  return prisma.viajes.update({
    where: { id },
    data: { conductor_id, vehiculo_id, estado: 'aceptado' },
    include,
  });
}

async function iniciar(id, conductorId) {
  const v = await prisma.viajes.findUnique({ where: { id } });
  if (!v) throw { status: 404, message: 'Viaje no encontrado' };
  if (v.conductor_id !== conductorId) throw { status: 403, message: 'No autorizado' };
  if (v.estado !== 'aceptado') throw { status: 409, message: 'El viaje debe estar aceptado' };

  return prisma.viajes.update({
    where: { id },
    data: { estado: 'en_curso', fecha_inicio: new Date() },
    include,
  });
}

async function finalizar(id, conductorId) {
  const v = await prisma.viajes.findUnique({ where: { id } });
  if (!v) throw { status: 404, message: 'Viaje no encontrado' };
  if (v.conductor_id !== conductorId) throw { status: 403, message: 'No autorizado' };
  if (v.estado !== 'en_curso') throw { status: 409, message: 'El viaje debe estar en curso' };

  return prisma.$transaction(async (tx) => {
    const viaje = await tx.viajes.update({
      where: { id },
      data: { estado: 'finalizado', fecha_fin: new Date() },
      include,
    });

    if (viaje.precio && viaje.precio > 0) {
      const pasajero = await tx.usuarios.findUnique({ where: { id: v.pasajero_id } });
      const conductor = await tx.usuarios.findUnique({ where: { id: conductorId } });

      await tx.pagos.create({
        data: {
          viaje_id: id,
          monto: viaje.precio,
          estado: 'completado',
          metodo: 'billetera',
          pagado_en: new Date(),
        },
      });

      await tx.usuarios.update({
        where: { id: v.pasajero_id },
        data: { saldo_billetera: { decrement: viaje.precio } },
      });

      await tx.usuarios.update({
        where: { id: conductorId },
        data: { saldo_billetera: { increment: viaje.precio } },
      });

      await tx.transacciones.createMany({
        data: [
          {
            usuario_id: v.pasajero_id,
            tipo: 'pago_viaje',
            monto: viaje.precio,
            saldo_anterior: pasajero.saldo_billetera,
            saldo_nuevo: Number(pasajero.saldo_billetera) - Number(viaje.precio),
            descripcion: `Pago viaje #${id}`,
          },
          {
            usuario_id: conductorId,
            tipo: 'cobro_viaje',
            monto: viaje.precio,
            saldo_anterior: conductor.saldo_billetera,
            saldo_nuevo: Number(conductor.saldo_billetera) + Number(viaje.precio),
            descripcion: `Cobro viaje #${id}`,
          },
        ],
      });
    }

    return viaje;
  });
}

async function cancelar(id, userId, motivo_cancelacion) {
  const v = await prisma.viajes.findUnique({ where: { id } });
  if (!v) throw { status: 404, message: 'Viaje no encontrado' };
  if (v.pasajero_id !== userId && v.conductor_id !== userId)
    throw { status: 403, message: 'No autorizado' };
  if (!['pendiente', 'aceptado'].includes(v.estado))
    throw { status: 409, message: 'No se puede cancelar en este estado' };

  return prisma.viajes.update({
    where: { id },
    data: { estado: 'cancelado', motivo_cancelacion },
    include,
  });
}

module.exports = { listar, obtener, solicitar, aceptar, iniciar, finalizar, cancelar };
