const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listar(conductorId) {
  return prisma.vehiculos.findMany({
    where: conductorId ? { conductor_id: conductorId, activo: true } : { activo: true },
    include: { conductor: { select: { id: true, nombre: true, apellido: true } } },
  });
}

async function obtener(id) {
  const v = await prisma.vehiculos.findUnique({
    where: { id },
    include: { conductor: { select: { id: true, nombre: true, apellido: true } } },
  });
  if (!v) throw { status: 404, message: 'Vehículo no encontrado' };
  return v;
}

async function crear(conductor_id, data) {
  const { marca, modelo, anio, color, placa, capacidad_pasajeros, foto_vehiculo, soat_vence, tecnomecanica_vence } = data;
  return prisma.vehiculos.create({
    data: { conductor_id, marca, modelo, anio, color, placa, capacidad_pasajeros, foto_vehiculo, soat_vence, tecnomecanica_vence },
  });
}

async function actualizar(id, conductorId, data) {
  const v = await prisma.vehiculos.findUnique({ where: { id } });
  if (!v) throw { status: 404, message: 'Vehículo no encontrado' };
  if (v.conductor_id !== conductorId) throw { status: 403, message: 'No autorizado' };

  const { marca, modelo, anio, color, placa, capacidad_pasajeros, foto_vehiculo, soat_vence, tecnomecanica_vence } = data;
  return prisma.vehiculos.update({
    where: { id },
    data: { marca, modelo, anio, color, placa, capacidad_pasajeros, foto_vehiculo, soat_vence, tecnomecanica_vence },
  });
}

async function desactivar(id, conductorId) {
  const v = await prisma.vehiculos.findUnique({ where: { id } });
  if (!v) throw { status: 404, message: 'Vehículo no encontrado' };
  if (v.conductor_id !== conductorId) throw { status: 403, message: 'No autorizado' };
  return prisma.vehiculos.update({ where: { id }, data: { activo: false } });
}

module.exports = { listar, obtener, crear, actualizar, desactivar };
