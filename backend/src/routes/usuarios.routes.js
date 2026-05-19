const router = require('express').Router();
const ctrl = require('../controllers/usuarios.controller');
const auth = require('../middlewares/auth.middleware');
const { permit } = require('../middlewares/permission.middleware');
const v = require('../validators/usuarios.validator');

router.get('/',                  auth, permit('usuarios','ver'),      ctrl.listar);
router.get('/:id',               auth, permit('usuarios','ver'),      v.idRule, ctrl.obtener);
router.put('/:id',               auth, permit('usuarios','editar'),   v.actualizarRules, ctrl.actualizar);
router.patch('/password',        auth,                                v.passwordRules, ctrl.cambiarPassword);
router.delete('/:id',            auth, permit('usuarios','eliminar'), v.idRule, ctrl.desactivar);
router.post('/:id/roles',        auth, permit('usuarios','editar'),   v.asignarRolRules, ctrl.asignarRol);

module.exports = router;
