const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

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

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:4200'];

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (Postman, mobile, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS bloqueado: ${origin}`));
  },
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());

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
