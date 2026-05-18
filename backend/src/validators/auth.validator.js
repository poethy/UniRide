const { body, validationResult } = require('express-validator');
const { fail } = require('../utils/response');

const handleErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return fail(res, errors.array()[0].msg, 422);
  next();
};

const registerRules = [
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
  body('apellido').trim().notEmpty().withMessage('El apellido es requerido'),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('universidad').optional().trim(),
  body('codigo_estudiantil').optional().trim(),
  handleErrors,
];

const loginRules = [
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
  handleErrors,
];

module.exports = { registerRules, loginRules };
