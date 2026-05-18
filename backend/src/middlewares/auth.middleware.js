const { verify } = require('../utils/jwt');
const { fail } = require('../utils/response');

module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer '))
    return fail(res, 'Token requerido', 401);

  try {
    req.user = verify(header.split(' ')[1]);
    next();
  } catch {
    return fail(res, 'Token inválido o expirado', 401);
  }
};
