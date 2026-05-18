const router = require('express').Router();
const ctrl = require('../controllers/viajes.controller');
const auth = require('../middlewares/auth.middleware');
const { permit } = require('../middlewares/permission.middleware');

router.get('/',              auth, permit('viajes','ver'),    ctrl.listar);
router.get('/:id',           auth, permit('viajes','ver'),    ctrl.obtener);
router.post('/',             auth, permit('viajes','crear'),  ctrl.solicitar);
router.patch('/:id/aceptar', auth, permit('viajes','editar'), ctrl.aceptar);
router.patch('/:id/iniciar', auth, permit('viajes','editar'), ctrl.iniciar);
router.patch('/:id/finalizar',auth,permit('viajes','editar'), ctrl.finalizar);
router.patch('/:id/cancelar',auth,                            ctrl.cancelar);

module.exports = router;
