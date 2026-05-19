const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Establecer conexión con la BD al arrancar el servidor
// para que la primera petición del usuario no tenga espera fría
prisma.$connect()
  .then(() => console.log('✓ Prisma conectado'))
  .catch(err => console.error('✗ Error de conexión Prisma:', err));

module.exports = prisma;
