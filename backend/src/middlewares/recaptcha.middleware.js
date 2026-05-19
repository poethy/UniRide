const { fail } = require('../utils/response');
const logger = require('../utils/logger');

const SECRET = process.env.RECAPTCHA_SECRET;
const VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const MIN_SCORE = parseFloat(process.env.RECAPTCHA_MIN_SCORE || '0.5');

/**
 * Verifica un token reCAPTCHA enviado por el cliente en req.body.recaptcha_token.
 * Si RECAPTCHA_SECRET no está definido en el entorno, el middleware queda en modo
 * "pasivo" para no romper desarrollo local. En producción RECAPTCHA_SECRET debe estar definido.
 */
module.exports = async (req, res, next) => {
  if (!SECRET) {
    if (process.env.NODE_ENV === 'production') {
      logger.warn('RECAPTCHA_SECRET no configurado en producción; bypass activado');
    }
    return next();
  }

  const token = req.body && req.body.recaptcha_token;
  if (!token) return fail(res, 'reCAPTCHA requerido', 400);

  try {
    const params = new URLSearchParams({ secret: SECRET, response: token });
    if (req.ip) params.append('remoteip', req.ip);

    const resp = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = await resp.json();

    if (!data.success) return fail(res, 'reCAPTCHA inválido', 400);
    // v3: score-based. v2: no score, success basta.
    if (typeof data.score === 'number' && data.score < MIN_SCORE) {
      return fail(res, 'reCAPTCHA score insuficiente', 400);
    }
    next();
  } catch (err) {
    logger.error({ err }, 'Error verificando reCAPTCHA');
    return fail(res, 'No se pudo verificar reCAPTCHA', 502);
  }
};
