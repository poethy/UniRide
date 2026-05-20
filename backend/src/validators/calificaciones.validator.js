const { body } = require('express-validator');
const { handleErrors, idParam } = require('./common');

const crearRules = [
  body('viaje_id').isInt({ min: 1 }).toInt(),
  body('calificado_id').isInt({ min: 1 }).toInt(),
  body('puntaje').isInt({ min: 1, max: 5 }).withMessage('puntaje debe estar entre 1 y 5').toInt(),
  body('comentario').optional().trim().isLength({ max: 500 }),
  handleErrors,
];

const usuarioParamRule = [idParam('usuario_id'), handleErrors];
const viajeParamRule = [idParam('viaje_id'), handleErrors];

module.exports = { crearRules, usuarioParamRule, viajeParamRule };
