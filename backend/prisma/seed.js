/**
 * Seed idempotente: roles, permisos, asignaciones rol→permiso, y usuario administrador.
 *
 * Uso:
 *   node prisma/seed.js
 *
 * Variables relevantes:
 *   ADMIN_EMAIL     (default: admin@uniride.local)
 *   ADMIN_PASSWORD  (default: admin12345)  ← cámbialo antes de prod
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const ROLES = [
  { id: 1, nombre: 'administrador', descripcion: 'Acceso completo' },
  { id: 2, nombre: 'conductor',     descripcion: 'Ofrece y opera viajes' },
  { id: 3, nombre: 'pasajero',      descripcion: 'Solicita viajes' },
];

const MODULOS = [
  'usuarios', 'vehiculos', 'rutas', 'viajes',
  'pagos', 'calificaciones', 'notificaciones', 'reportes',
];
const ACCIONES = ['ver', 'crear', 'editar', 'eliminar'];

// Mapa rol → (modulo → acciones). Si modulo no aparece, no tiene acceso.
const PERMISOS_POR_ROL = {
  administrador: Object.fromEntries(MODULOS.map((m) => [m, ACCIONES])),
  conductor: {
    usuarios:       ['ver'],
    vehiculos:      ['ver', 'crear', 'editar', 'eliminar'],
    rutas:          ['ver'],
    viajes:         ['ver', 'editar'],
    pagos:          ['ver', 'crear'],
    calificaciones: ['ver', 'crear'],
    notificaciones: ['ver'],
  },
  pasajero: {
    usuarios:       ['ver'],
    vehiculos:      ['ver'],
    rutas:          ['ver', 'crear'],
    viajes:         ['ver', 'crear'],
    pagos:          ['ver', 'crear'],
    calificaciones: ['ver', 'crear'],
    notificaciones: ['ver'],
  },
};

async function seedRoles() {
  for (const r of ROLES) {
    await prisma.roles.upsert({
      where: { id: r.id },
      update: { nombre: r.nombre, descripcion: r.descripcion },
      create: r,
    });
  }
  console.log(`✓ ${ROLES.length} roles`);
}

async function seedPermisos() {
  let total = 0;
  for (const modulo of MODULOS) {
    for (const accion of ACCIONES) {
      await prisma.permisos.upsert({
        where: { modulo_accion: { modulo, accion } },
        update: {},
        create: { modulo, accion, descripcion: `${accion} en ${modulo}` },
      });
      total++;
    }
  }
  console.log(`✓ ${total} permisos`);
}

async function seedRolesPermisos() {
  const allPermisos = await prisma.permisos.findMany();
  const byKey = new Map(allPermisos.map((p) => [`${p.modulo}:${p.accion}`, p.id]));

  for (const rol of ROLES) {
    const mapa = PERMISOS_POR_ROL[rol.nombre] || {};
    for (const [modulo, acciones] of Object.entries(mapa)) {
      for (const accion of acciones) {
        const permiso_id = byKey.get(`${modulo}:${accion}`);
        if (!permiso_id) continue;
        await prisma.roles_permisos.upsert({
          where: { rol_id_permiso_id: { rol_id: rol.id, permiso_id } },
          update: {},
          create: { rol_id: rol.id, permiso_id },
        });
      }
    }
  }
  console.log('✓ asignaciones rol → permiso');
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@uniride.local';
  const password = process.env.ADMIN_PASSWORD || 'admin12345';
  const password_hash = await bcrypt.hash(password, 10);

  const admin = await prisma.usuarios.upsert({
    where: { email },
    update: {},
    create: {
      nombre: 'Admin',
      apellido: 'UniRide',
      email,
      password_hash,
      email_verificado: true,
    },
  });

  await prisma.usuarios_roles.upsert({
    where: { usuario_id_rol_id: { usuario_id: admin.id, rol_id: 1 } },
    update: {},
    create: { usuario_id: admin.id, rol_id: 1 },
  });
  console.log(`✓ admin: ${email} (password: ${process.env.ADMIN_PASSWORD ? '[from env]' : 'admin12345'})`);
}

(async () => {
  try {
    await seedRoles();
    await seedPermisos();
    await seedRolesPermisos();
    await seedAdmin();
    console.log('Seed completado.');
  } catch (err) {
    console.error('Error en seed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
