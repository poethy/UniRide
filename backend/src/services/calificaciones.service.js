const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listarDeUsuario(calificado_id) {
  return prisma.calificaciones.findMany({
    where: { calificado_id },
    include: {
      calificador: { select: { id: true, nombre: true, apellido: true, foto_perfil: true } },
      viaje: { select: { id: true } },
    },
    orderBy: { created_at: 'desc' },
  });
}

async function crear(calificador_id, data) {
  const { viaje_id, calificado_id, puntaje, comentario } = data;

  if (calificador_id === calificado_id)
    throw { status: 400, message: 'No puedes calificarte a ti mismo' };

  const viaje = await prisma.viajes.findUnique({ where: { id: viaje_id } });
  if (!viaje) throw { status: 404, message: 'Viaje no encontrado' };
  if (viaje.estado !== 'finalizado')
    throw { status: 409, message: 'Solo se puede calificar viajes finalizados' };

  const esParticipante = viaje.pasajero_id === calificador_id || viaje.conductor_id === calificador_id;
  if (!esParticipante) throw { status: 403, message: 'No participaste en este viaje' };

  return prisma.calificaciones.create({
    data: { viaje_id, calificador_id, calificado_id, puntaje, comentario },
  });
}

async function promedioUsuario(usuario_id) {
  const result = await prisma.calificaciones.aggregate({
    where: { calificado_id: usuario_id },
    _avg: { puntaje: true },
    _count: true,
  });
  return { promedio: result._avg.puntaje, total: result._count };
}

module.exports = { listarDeUsuario, crear, promedioUsuario };
