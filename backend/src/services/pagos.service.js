const prisma = require('../utils/prisma');

async function listarPorUsuario(usuarioId) {
  return prisma.pagos.findMany({
    where: {
      viaje: {
        OR: [{ pasajero_id: usuarioId }, { conductor_id: usuarioId }],
      },
    },
    include: { viaje: { include: { ruta: true } } },
    orderBy: { created_at: 'desc' },
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

async function historialTransacciones(usuarioId) {
  return prisma.transacciones.findMany({
    where: { usuario_id: usuarioId },
    orderBy: { created_at: 'desc' },
  });
}

module.exports = { listarPorUsuario, obtener, recargarBilletera, historialTransacciones };
