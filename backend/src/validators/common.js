const { validationResult, param } = require('express-validator');
const { fail } = require('../utils/response');

const handleErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(res, errors.array()[0].msg, 422);
  next();
};

const idParam = (name = 'id') =>
  param(name).isInt({ min: 1 }).withMessage(`${name} debe ser un entero positivo`).toInt();

module.exports = { handleErrors, idParam };
