const { body } = require('express-validator');
const { handleErrors, idParam } = require('./common');

const actualizarRules = [
  idParam('id'),
  body('nombre').optional().trim().notEmpty(),
  body('apellido').optional().trim().notEmpty(),
  body('telefono').optional().trim().isLength({ max: 20 }),
  body('universidad').optional().trim().isLength({ max: 150 }),
  body('codigo_estudiantil').optional().trim().isLength({ max: 50 }),
  body('foto_perfil').optional().isString().isLength({ max: 500 }),
  handleErrors,
];

const passwordRules = [
  body('password_actual').notEmpty().withMessage('password_actual es requerida'),
  body('password_nueva').isLength({ min: 6 }).withMessage('password_nueva debe tener al menos 6 caracteres'),
  handleErrors,
];

const idRule = [idParam('id'), handleErrors];

const asignarRolRules = [
  idParam('id'),
  body('rol_id').isInt({ min: 1 }).toInt(),
  handleErrors,
];

module.exports = { actualizarRules, passwordRules, idRule, asignarRolRules };
