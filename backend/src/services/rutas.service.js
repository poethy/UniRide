const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listar() {
  return prisma.rutas.findMany({ include: { puntos_ruta: { orderBy: { orden: 'asc' } } } });
}

async function obtener(id) {
  const r = await prisma.rutas.findUnique({
    where: { id },
    include: { puntos_ruta: { orderBy: { orden: 'asc' } } },
  });
  if (!r) throw { status: 404, message: 'Ruta no encontrada' };
  return r;
}

async function crear(data) {
  const { nombre, origen_descripcion, origen_lat, origen_lng, destino_descripcion,
          destino_lat, destino_lng, distancia_km, duracion_min, puntos } = data;

  return prisma.rutas.create({
    data: {
      nombre, origen_descripcion, origen_lat, origen_lng,
      destino_descripcion, destino_lat, destino_lng, distancia_km, duracion_min,
      puntos_ruta: puntos?.length
        ? { create: puntos.map((p, i) => ({ orden: i + 1, descripcion: p.descripcion, latitud: p.latitud, longitud: p.longitud })) }
        : undefined,
    },
    include: { puntos_ruta: true },
  });
}

async function actualizar(id, data) {
  const { nombre, origen_descripcion, origen_lat, origen_lng, destino_descripcion,
          destino_lat, destino_lng, distancia_km, duracion_min } = data;
  return prisma.rutas.update({
    where: { id },
    data: { nombre, origen_descripcion, origen_lat, origen_lng, destino_descripcion,
            destino_lat, destino_lng, distancia_km, duracion_min },
  });
}

async function eliminar(id) {
  await prisma.rutas.delete({ where: { id } });
}

async function favoritos(usuarioId) {
  return prisma.rutas_favoritas.findMany({
    where: { usuario_id: usuarioId },
    include: { ruta: true },
  });
}

async function agregarFavorito(usuarioId, ruta_id, alias) {
  return prisma.rutas_favoritas.upsert({
    where: { usuario_id_ruta_id: { usuario_id: usuarioId, ruta_id } },
    create: { usuario_id: usuarioId, ruta_id, alias },
    update: { alias },
  });
}

async function quitarFavorito(usuarioId, ruta_id) {
  await prisma.rutas_favoritas.delete({
    where: { usuario_id_ruta_id: { usuario_id: usuarioId, ruta_id } },
  });
}

module.exports = { listar, obtener, crear, actualizar, eliminar, favoritos, agregarFavorito, quitarFavorito };
