const { body } = require('express-validator');
const { handleErrors, idParam } = require('./common');

const solicitarRules = [
  body('ruta_id').isInt({ min: 1 }).withMessage('ruta_id es requerido').toInt(),
  body('precio').optional().isFloat({ min: 0 }).withMessage('precio debe ser >= 0').toFloat(),
  handleErrors,
];

const aceptarRules = [
  idParam('id'),
  body('vehiculo_id').isInt({ min: 1 }).withMessage('vehiculo_id es requerido').toInt(),
  handleErrors,
];

const cancelarRules = [
  idParam('id'),
  body('motivo_cancelacion').optional().isString().isLength({ max: 255 }),
  handleErrors,
];

const ubicacionRules = [
  idParam('id'),
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('lat inválida').toFloat(),
  body('lng').isFloat({ min: -180, max: 180 }).withMessage('lng inválida').toFloat(),
  handleErrors,
];

const idRule = [idParam('id'), handleErrors];

module.exports = { solicitarRules, aceptarRules, cancelarRules, ubicacionRules, idRule };
