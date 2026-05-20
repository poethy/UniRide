const { body } = require('express-validator');
const { handleErrors, idParam } = require('./common');

const año = new Date().getFullYear();

const crearRules = [
  body('marca').trim().notEmpty().withMessage('marca es requerida'),
  body('modelo').trim().notEmpty().withMessage('modelo es requerido'),
  body('anio').isInt({ min: 1950, max: año + 1 }).withMessage('anio inválido').toInt(),
  body('color').trim().notEmpty().withMessage('color es requerido'),
  body('placa').trim().notEmpty().isLength({ max: 20 }).withMessage('placa inválida'),
  body('capacidad_pasajeros').optional().isInt({ min: 1, max: 20 }).toInt(),
  handleErrors,
];

const actualizarRules = [idParam('id'), ...crearRules.slice(0, -1), handleErrors];
const idRule = [idParam('id'), handleErrors];

module.exports = { crearRules, actualizarRules, idRule };
