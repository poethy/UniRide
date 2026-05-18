const router = require('express').Router();
const ctrl = require('../controllers/usuarios.controller');
const auth = require('../middlewares/auth.middleware');
const { permit } = require('../middlewares/permission.middleware');

router.get('/',                  auth, permit('usuarios','ver'),      ctrl.listar);
router.get('/:id',               auth, permit('usuarios','ver'),      ctrl.obtener);
router.put('/:id',               auth, permit('usuarios','editar'),   ctrl.actualizar);
router.patch('/password',        auth,                                ctrl.cambiarPassword);
router.delete('/:id',            auth, permit('usuarios','eliminar'), ctrl.desactivar);
router.post('/:id/roles',        auth, permit('usuarios','editar'),   ctrl.asignarRol);

module.exports = router;
