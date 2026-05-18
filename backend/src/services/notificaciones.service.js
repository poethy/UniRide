const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listar(usuario_id) {
  return prisma.notificaciones.findMany({
    where: { usuario_id },
    orderBy: { created_at: 'desc' },
  });
}

async function crear(data) {
  const { usuario_id, titulo, mensaje, tipo = 'info', viaje_id } = data;
  return prisma.notificaciones.create({ data: { usuario_id, titulo, mensaje, tipo, viaje_id } });
}

async function marcarLeida(id, usuario_id) {
  const n = await prisma.notificaciones.findUnique({ where: { id } });
  if (!n) throw { status: 404, message: 'Notificación no encontrada' };
  if (n.usuario_id !== usuario_id) throw { status: 403, message: 'No autorizado' };
  return prisma.notificaciones.update({ where: { id }, data: { leida: true } });
}

async function marcarTodasLeidas(usuario_id) {
  await prisma.notificaciones.updateMany({ where: { usuario_id, leida: false }, data: { leida: true } });
}

module.exports = { listar, crear, marcarLeida, marcarTodasLeidas };
