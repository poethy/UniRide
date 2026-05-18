const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const select = {
  id: true, uuid: true, nombre: true, apellido: true, email: true,
  telefono: true, foto_perfil: true, universidad: true, codigo_estudiantil: true,
  saldo_billetera: true, activo: true, email_verificado: true, created_at: true,
  usuarios_roles: { include: { rol: { select: { id: true, nombre: true } } } },
};

async function listar() {
  return prisma.usuarios.findMany({ select });
}

async function obtener(id) {
  const u = await prisma.usuarios.findUnique({ where: { id }, select });
  if (!u) throw { status: 404, message: 'Usuario no encontrado' };
  return u;
}

async function actualizar(id, data) {
  const { nombre, apellido, telefono, foto_perfil, universidad, codigo_estudiantil } = data;
  return prisma.usuarios.update({
    where: { id },
    data: { nombre, apellido, telefono, foto_perfil, universidad, codigo_estudiantil },
    select,
  });
}

async function cambiarPassword(id, { password_actual, password_nuevo }) {
  const u = await prisma.usuarios.findUnique({ where: { id } });
  const ok = await bcrypt.compare(password_actual, u.password_hash);
  if (!ok) throw { status: 401, message: 'Contraseña actual incorrecta' };
  const hash = await bcrypt.hash(password_nuevo, 10);
  await prisma.usuarios.update({ where: { id }, data: { password_hash: hash } });
}

async function desactivar(id) {
  return prisma.usuarios.update({ where: { id }, data: { activo: false }, select });
}

async function asignarRol(usuario_id, rol_id) {
  return prisma.usuarios_roles.upsert({
    where: { usuario_id_rol_id: { usuario_id, rol_id } },
    create: { usuario_id, rol_id },
    update: {},
  });
}

module.exports = { listar, obtener, actualizar, cambiarPassword, desactivar, asignarRol };
