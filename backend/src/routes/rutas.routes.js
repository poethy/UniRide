const router = require('express').Router();
const ctrl = require('../controllers/rutas.controller');
const auth = require('../middlewares/auth.middleware');
const { permit } = require('../middlewares/permission.middleware');

router.get('/',                      auth, permit('rutas','ver'),      ctrl.listar);
router.get('/favoritas',             auth,                             ctrl.favoritos);
router.get('/:id',                   auth, permit('rutas','ver'),      ctrl.obtener);
router.post('/',                     auth, permit('rutas','crear'),    ctrl.crear);
router.put('/:id',                   auth, permit('rutas','editar'),   ctrl.actualizar);
router.delete('/:id',                auth, permit('rutas','eliminar'), ctrl.eliminar);
router.post('/favoritas',            auth,                             ctrl.agregarFavorito);
router.delete('/favoritas/:ruta_id', auth,                             ctrl.quitarFavorito);

module.exports = router;
