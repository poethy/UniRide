const prisma = require('../utils/prisma');

async function resumenGeneral() {
  const [totalUsuarios, totalViajes, totalVehiculos, ingresoTotal] = await Promise.all([
    prisma.usuarios.count({ where: { activo: true } }),
    prisma.viajes.count(),
    prisma.vehiculos.count({ where: { activo: true } }),
    prisma.pagos.aggregate({ where: { estado: 'completado' }, _sum: { monto: true } }),
  ]);

  return {
    total_usuarios: totalUsuarios,
    total_viajes: totalViajes,
    total_vehiculos: totalVehiculos,
    ingreso_total: ingresoTotal._sum.monto || 0,
  };
}

async function viajesPorEstado() {
  const estados = ['pendiente', 'aceptado', 'en_curso', 'finalizado', 'cancelado'];
  const counts = await Promise.all(
    estados.map((estado) => prisma.viajes.count({ where: { estado } }))
  );
  return Object.fromEntries(estados.map((e, i) => [e, counts[i]]));
}

async function topConductores(limit = 5) {
  return prisma.calificaciones.groupBy({
    by: ['calificado_id'],
    _avg: { puntaje: true },
    _count: true,
    orderBy: { _avg: { puntaje: 'desc' } },
    take: limit,
  });
}

async function actividadReciente(dias = 30) {
  const desde = new Date();
  desde.setDate(desde.getDate() - dias);

  return prisma.viajes.findMany({
    where: { created_at: { gte: desde } },
    include: {
      pasajero:  { select: { nombre: true, apellido: true } },
      conductor: { select: { nombre: true, apellido: true } },
      ruta:      { select: { origen_descripcion: true, destino_descripcion: true } },
    },
    orderBy: { created_at: 'desc' },
    take: 50,
  });
}

module.exports = { resumenGeneral, viajesPorEstado, topConductores, actividadReciente };
