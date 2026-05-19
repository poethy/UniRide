const router = require('express').Router();
const ctrl = require('../controllers/rutas.controller');
const auth = require('../middlewares/auth.middleware');
const { permit } = require('../middlewares/permission.middleware');
const v = require('../validators/rutas.validator');

router.get('/',                      auth, permit('rutas','ver'),      ctrl.listar);
router.get('/favoritas',             auth,                             ctrl.favoritos);
router.get('/:id',                   auth, permit('rutas','ver'),      v.idRule, ctrl.obtener);
router.post('/',                     auth, permit('rutas','crear'),    v.crearRules, ctrl.crear);
router.put('/:id',                   auth, permit('rutas','editar'),   v.actualizarRules, ctrl.actualizar);
router.delete('/:id',                auth, permit('rutas','eliminar'), v.idRule, ctrl.eliminar);
router.post('/favoritas',            auth,                             v.favoritoRules, ctrl.agregarFavorito);
router.delete('/favoritas/:ruta_id', auth,                             ctrl.quitarFavorito);

module.exports = router;
