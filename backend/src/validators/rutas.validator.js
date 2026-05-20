const { body } = require('express-validator');
const { handleErrors, idParam } = require('./common');

const crearRules = [
  body('origen_descripcion').trim().notEmpty().withMessage('origen_descripcion es requerido'),
  body('origen_lat').isFloat({ min: -90, max: 90 }).withMessage('origen_lat inválida').toFloat(),
  body('origen_lng').isFloat({ min: -180, max: 180 }).withMessage('origen_lng inválida').toFloat(),
  body('destino_descripcion').trim().notEmpty().withMessage('destino_descripcion es requerido'),
  body('destino_lat').isFloat({ min: -90, max: 90 }).withMessage('destino_lat inválida').toFloat(),
  body('destino_lng').isFloat({ min: -180, max: 180 }).withMessage('destino_lng inválida').toFloat(),
  body('nombre').optional().trim().isLength({ max: 150 }),
  handleErrors,
];

const actualizarRules = [idParam('id'), ...crearRules];
const idRule = [idParam('id'), handleErrors];

const favoritoRules = [
  body('ruta_id').isInt({ min: 1 }).toInt(),
  body('alias').optional().trim().isLength({ max: 100 }),
  handleErrors,
];

module.exports = { crearRules, actualizarRules, idRule, favoritoRules };
