const svc = require('../services/notificaciones.service');
const { ok, fail } = require('../utils/response');

const listar = async (req, res, next) => {
  try { return ok(res, await svc.listar(req.user.id)); }
  catch (err) { next(err); }
};

const marcarLeida = async (req, res, next) => {
  try { return ok(res, await svc.marcarLeida(Number(req.params.id), req.user.id)); }
  catch (err) {
    if (err.status) return fail(res, err.message, err.status);
    next(err);
  }
};

const marcarTodasLeidas = async (req, res, next) => {
  try {
    await svc.marcarTodasLeidas(req.user.id);
    return ok(res, { message: 'Todas marcadas como leídas' });
  } catch (err) { next(err); }
};

module.exports = { listar, marcarLeida, marcarTodasLeidas };
