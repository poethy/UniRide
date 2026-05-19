const router = require('express').Router();
const ctrl = require('../controllers/viajes.controller');
const auth = require('../middlewares/auth.middleware');
const { permit } = require('../middlewares/permission.middleware');
const v = require('../validators/viajes.validator');

router.get('/',                  auth, permit('viajes','ver'),    ctrl.listar);
router.get('/:id',               auth, permit('viajes','ver'),    v.idRule, ctrl.obtener);
router.post('/',                 auth, permit('viajes','crear'),  v.solicitarRules, ctrl.solicitar);
router.patch('/:id/aceptar',     auth, permit('viajes','editar'), v.aceptarRules, ctrl.aceptar);
router.patch('/:id/iniciar',     auth, permit('viajes','editar'), v.idRule, ctrl.iniciar);
router.patch('/:id/finalizar',   auth, permit('viajes','editar'), v.idRule, ctrl.finalizar);
router.patch('/:id/cancelar',    auth,                            v.cancelarRules, ctrl.cancelar);
router.put('/:id/ubicacion',     auth, permit('viajes','editar'), v.ubicacionRules, ctrl.actualizarUbicacion);
router.get('/:id/ubicacion',     auth, permit('viajes','ver'),    v.idRule, ctrl.obtenerUbicacion);

module.exports = router;
