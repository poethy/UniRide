const router = require('express').Router();
const ctrl = require('../controllers/calificaciones.controller');
const auth = require('../middlewares/auth.middleware');
const { permit } = require('../middlewares/permission.middleware');

router.get('/usuario/:usuario_id',          auth, permit('calificaciones','ver'),   ctrl.listar);
router.get('/usuario/:usuario_id/dadas',   auth, permit('calificaciones','ver'),   ctrl.listarDadas);
router.get('/usuario/:usuario_id/promedio',auth, permit('calificaciones','ver'),   ctrl.promedio);
router.post('/',                           auth, permit('calificaciones','crear'),  ctrl.crear);
router.get('/viaje/:viaje_id/ya-califique',auth, permit('calificaciones','ver'),   ctrl.yaCalifique);

module.exports = router;
