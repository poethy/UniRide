const prisma = require('../utils/prisma');

async function listarPorUsuario(usuarioId, pag = null) {
  const where = {
    viaje: { OR: [{ pasajero_id: usuarioId }, { conductor_id: usuarioId }] },
  };
  const include = { viaje: { include: { ruta: true } } };

  if (pag && pag.paginated) {
    const [items, total] = await Promise.all([
      prisma.pagos.findMany({ where, include, orderBy: { created_at: 'desc' }, skip: pag.skip, take: pag.take }),
      prisma.pagos.count({ where }),
    ]);
    return { items, total };
  }
  return prisma.pagos.findMany({
    where, include, orderBy: { created_at: 'desc' }, take: pag ? pag.take : 500,
  });
}

async function obtener(id) {
  const p = await prisma.pagos.findUnique({ where: { id }, include: { viaje: true } });
  if (!p) throw { status: 404, message: 'Pago no encontrado' };
  return p;
}

async function recargarBilletera(usuarioId, monto) {
  if (monto <= 0) throw { status: 400, message: 'El monto debe ser positivo' };

  return prisma.$transaction(async (tx) => {
    const usuario = await tx.usuarios.findUnique({ where: { id: usuarioId } });
    const saldo_nuevo = Number(usuario.saldo_billetera) + monto;

    await tx.usuarios.update({
      where: { id: usuarioId },
      data: { saldo_billetera: { increment: monto } },
    });

    return tx.transacciones.create({
      data: {
        usuario_id: usuarioId,
        tipo: 'recarga',
        monto,
        saldo_anterior: usuario.saldo_billetera,
        saldo_nuevo,
        descripcion: `Recarga de billetera por $${monto}`,
      },
    });
  });
}

async function historialTransacciones(usuarioId, pag = null) {
  const where = { usuario_id: usuarioId };
  if (pag && pag.paginated) {
    const [items, total] = await Promise.all([
      prisma.transacciones.findMany({ where, orderBy: { created_at: 'desc' }, skip: pag.skip, take: pag.take }),
      prisma.transacciones.count({ where }),
    ]);
    return { items, total };
  }
  return prisma.transacciones.findMany({
    where, orderBy: { created_at: 'desc' }, take: pag ? pag.take : 500,
  });
}

module.exports = { listarPorUsuario, obtener, recargarBilletera, historialTransacciones };
