const router = require('express').Router();
const ctrl = require('../controllers/vehiculos.controller');
const auth = require('../middlewares/auth.middleware');
const { permit } = require('../middlewares/permission.middleware');
const v = require('../validators/vehiculos.validator');

router.get('/',      auth, permit('vehiculos','ver'),      ctrl.listar);
router.get('/:id',   auth, permit('vehiculos','ver'),      v.idRule, ctrl.obtener);
router.post('/',     auth, permit('vehiculos','crear'),    v.crearRules, ctrl.crear);
router.put('/:id',   auth, permit('vehiculos','editar'),   v.idRule, ctrl.actualizar);
router.delete('/:id',auth, permit('vehiculos','eliminar'), v.idRule, ctrl.desactivar);

module.exports = router;
