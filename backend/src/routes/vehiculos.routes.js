const router = require('express').Router();
const ctrl = require('../controllers/vehiculos.controller');
const auth = require('../middlewares/auth.middleware');
const { permit } = require('../middlewares/permission.middleware');

router.get('/',      auth, permit('vehiculos','ver'),      ctrl.listar);
router.get('/:id',   auth, permit('vehiculos','ver'),      ctrl.obtener);
router.post('/',     auth, permit('vehiculos','crear'),    ctrl.crear);
router.put('/:id',   auth, permit('vehiculos','editar'),   ctrl.actualizar);
router.delete('/:id',auth, permit('vehiculos','eliminar'), ctrl.desactivar);

module.exports = router;
