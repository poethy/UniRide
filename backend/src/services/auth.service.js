const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');
const { sign } = require('../utils/jwt');

const ROLES_VALIDOS = [1, 2, 3];

async function register(data) {
  const { nombre, apellido, email, password, telefono, universidad, codigo_estudiantil, rol_id } = data;

  const existe = await prisma.usuarios.findUnique({ where: { email } });
  if (existe) throw { status: 409, message: 'El email ya está registrado' };

  const rolAsignado = ROLES_VALIDOS.includes(Number(rol_id)) ? Number(rol_id) : 3;
  const password_hash = await bcrypt.hash(password, 10);

  const usuario = await prisma.usuarios.create({
    data: {
      nombre,
      apellido,
      email,
      password_hash,
      telefono,
      universidad,
      codigo_estudiantil,
      usuarios_roles: { create: { rol_id: rolAsignado } },
    },
    select: { id: true, uuid: true, nombre: true, apellido: true, email: true, created_at: true },
  });

  return usuario;
}

async function login(email, password) {
  const usuario = await prisma.usuarios.findUnique({
    where: { email },
    include: {
      usuarios_roles: { include: { rol: true } },
    },
  });

  if (!usuario || !usuario.activo)
    throw { status: 401, message: 'Credenciales inválidas' };

  const match = await bcrypt.compare(password, usuario.password_hash);
  if (!match) throw { status: 401, message: 'Credenciales inválidas' };

  const roles = usuario.usuarios_roles.map((ur) => ur.rol.nombre);

  const token = sign({ id: usuario.id, uuid: usuario.uuid, email: usuario.email, roles });

  return {
    token,
    usuario: {
      id: usuario.id,
      uuid: usuario.uuid,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      roles,
      saldo_billetera: usuario.saldo_billetera,
    },
  };
}

async function perfil(userId) {
  const usuario = await prisma.usuarios.findUnique({
    where: { id: userId },
    select: {
      id: true, uuid: true, nombre: true, apellido: true, email: true,
      telefono: true, foto_perfil: true, universidad: true, codigo_estudiantil: true,
      saldo_billetera: true, email_verificado: true, created_at: true,
      usuarios_roles: { include: { rol: { select: { nombre: true } } } },
    },
  });

  if (!usuario) throw { status: 404, message: 'Usuario no encontrado' };
  return {
    ...usuario,
    roles: usuario.usuarios_roles.map((ur) => ur.rol.nombre),
    usuarios_roles: undefined,
  };
}

module.exports = { register, login, perfil };
