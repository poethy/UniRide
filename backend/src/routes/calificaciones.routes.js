const router = require('express').Router();
const ctrl = require('../controllers/calificaciones.controller');
const auth = require('../middlewares/auth.middleware');
const { permit } = require('../middlewares/permission.middleware');
const v = require('../validators/calificaciones.validator');

router.get('/usuario/:usuario_id',          auth, permit('calificaciones','ver'),   v.usuarioParamRule, ctrl.listar);
router.get('/usuario/:usuario_id/dadas',   auth, permit('calificaciones','ver'),    v.usuarioParamRule, ctrl.listarDadas);
router.get('/usuario/:usuario_id/promedio',auth, permit('calificaciones','ver'),    v.usuarioParamRule, ctrl.promedio);
router.post('/',                           auth, permit('calificaciones','crear'),  v.crearRules, ctrl.crear);
router.get('/viaje/:viaje_id/ya-califique',auth, permit('calificaciones','ver'),    v.viajeParamRule, ctrl.yaCalifique);

module.exports = router;
