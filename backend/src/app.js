const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pinoHttp = require('pino-http');

const logger = require('./utils/logger');
const errorMiddleware = require('./middlewares/error.middleware');

const authRoutes           = require('./routes/auth.routes');
const usuariosRoutes       = require('./routes/usuarios.routes');
const vehiculosRoutes      = require('./routes/vehiculos.routes');
const rutasRoutes          = require('./routes/rutas.routes');
const viajesRoutes         = require('./routes/viajes.routes');
const pagosRoutes          = require('./routes/pagos.routes');
const calificacionesRoutes = require('./routes/calificaciones.routes');
const notificacionesRoutes = require('./routes/notificaciones.routes');
const reportesRoutes       = require('./routes/reportes.routes');

const app = express();

// Express está detrás de un proxy en Railway/Vercel: necesario para rate-limit por IP real
app.set('trust proxy', 1);

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:4200'];

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (Postman, mobile, health checks).
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // No lanzar excepción: devolver false → cors responde 403 limpio.
    logger.warn({ origin }, 'CORS bloqueado');
    return callback(null, false);
  },
  credentials: true,
}));

app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/health' || req.url === '/api/health' } }));
app.use(express.json({ limit: '1mb' }));

// Healthcheck (Railway / load balancers)
app.get('/health', (req, res) => res.json({ ok: true, status: 'up', ts: Date.now() }));
app.get('/api/health', (req, res) => res.json({ ok: true, status: 'up', ts: Date.now() }));

app.use('/api/auth',           authRoutes);
app.use('/api/usuarios',       usuariosRoutes);
app.use('/api/vehiculos',      vehiculosRoutes);
app.use('/api/rutas',          rutasRoutes);
app.use('/api/viajes',         viajesRoutes);
app.use('/api/pagos',          pagosRoutes);
app.use('/api/calificaciones', calificacionesRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/reportes',       reportesRoutes);

app.use(errorMiddleware);

module.exports = app;
