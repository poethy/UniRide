const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const ctrl = require('../controllers/auth.controller');
const auth = require('../middlewares/auth.middleware');
const recaptcha = require('../middlewares/recaptcha.middleware');
const { registerRules, loginRules } = require('../validators/auth.validator');

// Rate limit estricto contra fuerza bruta en login/register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: 'Demasiados intentos. Inténtalo más tarde.' },
});

router.post('/register', authLimiter, recaptcha, registerRules, ctrl.register);
router.post('/login',    authLimiter, recaptcha, loginRules,    ctrl.login);
router.get('/me',        auth,                                   ctrl.perfil);

module.exports = router;
