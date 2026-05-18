const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const auth = require('../middlewares/auth.middleware');
const { registerRules, loginRules } = require('../validators/auth.validator');

router.post('/register', registerRules, ctrl.register);
router.post('/login',    loginRules,    ctrl.login);
router.get('/me',        auth,          ctrl.perfil);

module.exports = router;
