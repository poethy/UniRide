require('dotenv').config();

const logger = require('./src/utils/logger');

// Fail-fast: variables de entorno críticas
const REQUIRED_ENV = ['JWT_SECRET', 'DATABASE_URL'];
const missing = REQUIRED_ENV.filter((k) => !process.env[k] || !process.env[k].trim());
if (missing.length) {
  logger.fatal({ missing }, 'Faltan variables de entorno obligatorias');
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
  logger.warn('JWT_SECRET tiene menos de 32 caracteres; usa un secreto más fuerte en producción');
}

const app = require('./src/app');
const prisma = require('./src/utils/prisma');

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info(`UniRide API corriendo en http://localhost:${PORT}`);
});

// Shutdown ordenado para Railway (SIGTERM) y Ctrl+C local (SIGINT).
const shutdown = async (signal) => {
  logger.info({ signal }, 'Apagando servidor...');
  server.close(async () => {
    try {
      await prisma.$disconnect();
      logger.info('Prisma desconectado. Bye.');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error al desconectar Prisma');
      process.exit(1);
    }
  });
  // Failsafe: forzar exit a los 10s.
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled rejection');
});
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception');
  process.exit(1);
});
