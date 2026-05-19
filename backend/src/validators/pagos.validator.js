const { body } = require('express-validator');
const { handleErrors, idParam } = require('./common');

const recargarRules = [
  body('monto').isFloat({ gt: 0 }).withMessage('monto debe ser mayor a 0').toFloat(),
  handleErrors,
];

const idRule = [idParam('id'), handleErrors];

module.exports = { recargarRules, idRule };
