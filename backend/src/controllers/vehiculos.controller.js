const svc = require('../services/vehiculos.service');
const { ok, created, fail } = require('../utils/response');

const listar = async (req, res, next) => {
  try {
    const conductorId = req.query.conductor_id ? Number(req.query.conductor_id) : null;
    return ok(res, await svc.listar(conductorId));
  } catch (err) { next(err); }
};

const obtener = async (req, res, next) => {
  try {
    return ok(res, await svc.obtener(Number(req.params.id)));
  } catch (err) {
    if (err.status) return fail(res, err.message, err.status);
    next(err);
  }
};

const crear = async (req, res, next) => {
  try {
    return created(res, await svc.crear(req.user.id, req.body));
  } catch (err) { next(err); }
};

const actualizar = async (req, res, next) => {
  try {
    return ok(res, await svc.actualizar(Number(req.params.id), req.user.id, req.body));
  } catch (err) {
    if (err.status) return fail(res, err.message, err.status);
    next(err);
  }
};

const desactivar = async (req, res, next) => {
  try {
    return ok(res, await svc.desactivar(Number(req.params.id), req.user.id));
  } catch (err) {
    if (err.status) return fail(res, err.message, err.status);
    next(err);
  }
};

module.exports = { listar, obtener, crear, actualizar, desactivar };
