const router = require('express').Router();
const ctrl = require('../controllers/pagos.controller');
const auth = require('../middlewares/auth.middleware');
const { permit } = require('../middlewares/permission.middleware');
const v = require('../validators/pagos.validator');

router.get('/',               auth, permit('pagos','ver'),   ctrl.listar);
router.get('/transacciones',  auth,                          ctrl.transacciones);
router.get('/:id',            auth, permit('pagos','ver'),   v.idRule, ctrl.obtener);
router.post('/recargar',      auth, permit('pagos','crear'), v.recargarRules, ctrl.recargar);

module.exports = router;
