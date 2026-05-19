const svc = require('../services/calificaciones.service');
const { ok, created, fail } = require('../utils/response');

const listar = async (req, res, next) => {
  try {
    return ok(res, await svc.listarDeUsuario(Number(req.params.usuario_id)));
  } catch (err) { next(err); }
};

const crear = async (req, res, next) => {
  try { return created(res, await svc.crear(req.user.id, req.body)); }
  catch (err) {
    if (err.status) return fail(res, err.message, err.status);
    next(err);
  }
};

const promedio = async (req, res, next) => {
  try { return ok(res, await svc.promedioUsuario(Number(req.params.usuario_id))); }
  catch (err) { next(err); }
};

const yaCalifique = async (req, res, next) => {
  try {
    return ok(res, await svc.yaCalificoViaje(req.user.id, Number(req.params.viaje_id)));
  } catch (err) { next(err); }
};

module.exports = { listar, crear, promedio, yaCalifique };
