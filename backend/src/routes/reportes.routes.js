const router = require('express').Router();
const ctrl = require('../controllers/reportes.controller');
const auth = require('../middlewares/auth.middleware');
const { permit } = require('../middlewares/permission.middleware');

router.get('/resumen',         auth, permit('reportes','ver'), ctrl.resumen);
router.get('/viajes/estados',  auth, permit('reportes','ver'), ctrl.porEstado);
router.get('/top-conductores', auth, permit('reportes','ver'), ctrl.topConductores);
router.get('/actividad',       auth, permit('reportes','ver'), ctrl.actividad);

module.exports = router;
