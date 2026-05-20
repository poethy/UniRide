const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  const status = err.status || 500;
  const isServerError = status >= 500;

  // Loguear siempre con contexto; los 5xx se loguean como error, los 4xx como warn.
  const logPayload = { err, status, path: req.originalUrl, method: req.method };
  if (isServerError) logger.error(logPayload, 'Error de servidor');
  else logger.warn(logPayload, 'Error de cliente');

  // No exponer detalles internos al cliente en errores 5xx en producción.
  const message = isServerError && process.env.NODE_ENV === 'production'
    ? 'Error interno del servidor'
    : (err.message || 'Error interno del servidor');

  res.status(status).json({ ok: false, message });
};
