const router = require('express').Router();
const ctrl = require('../controllers/calificaciones.controller');
const auth = require('../middlewares/auth.middleware');
const { permit } = require('../middlewares/permission.middleware');

router.get('/usuario/:usuario_id',         auth, permit('calificaciones','ver'),   ctrl.listar);
router.get('/usuario/:usuario_id/promedio',auth, permit('calificaciones','ver'),   ctrl.promedio);
router.post('/',                           auth, permit('calificaciones','crear'),  ctrl.crear);

module.exports = router;
