const router = require('express').Router();
const ctrl = require('../controllers/notificaciones.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/',              auth, ctrl.listar);
router.patch('/:id/leer',    auth, ctrl.marcarLeida);
router.patch('/leer-todas',  auth, ctrl.marcarTodasLeidas);

module.exports = router;
