const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

const prisma = new PrismaClient();

// Establecer conexión con la BD al arrancar el servidor
// para que la primera petición del usuario no tenga espera fría.
prisma.$connect()
  .then(() => logger.info('Prisma conectado'))
  .catch((err) => logger.error({ err }, 'Error de conexión Prisma'));

module.exports = prisma;
