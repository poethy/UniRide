const svc = require('../services/viajes.service');
const { ok, created, fail } = require('../utils/response');

const listar = async (req, res, next) => {
  try {
    const { pasajero_id, conductor_id, estado } = req.query;
    return ok(res, await svc.listar({
      pasajero_id:  pasajero_id  ? Number(pasajero_id)  : undefined,
      conductor_id: conductor_id ? Number(conductor_id) : undefined,
      estado,
    }));
  } catch (err) { next(err); }
};

const obtener = async (req, res, next) => {
  try { return ok(res, await svc.obtener(Number(req.params.id))); }
  catch (err) {
    if (err.status) return fail(res, err.message, err.status);
    next(err);
  }
};

const solicitar = async (req, res, next) => {
  try { return created(res, await svc.solicitar(req.user.id, req.body)); }
  catch (err) { next(err); }
};

const aceptar = async (req, res, next) => {
  try {
    return ok(res, await svc.aceptar(Number(req.params.id), req.user.id, req.body.vehiculo_id));
  } catch (err) {
    if (err.status) return fail(res, err.message, err.status);
    next(err);
  }
};

const iniciar = async (req, res, next) => {
  try { return ok(res, await svc.iniciar(Number(req.params.id), req.user.id)); }
  catch (err) {
    if (err.status) return fail(res, err.message, err.status);
    next(err);
  }
};

const finalizar = async (req, res, next) => {
  try { return ok(res, await svc.finalizar(Number(req.params.id), req.user.id)); }
  catch (err) {
    if (err.status) return fail(res, err.message, err.status);
    next(err);
  }
};

const cancelar = async (req, res, next) => {
  try {
    return ok(res, await svc.cancelar(Number(req.params.id), req.user.id, req.body.motivo_cancelacion));
  } catch (err) {
    if (err.status) return fail(res, err.message, err.status);
    next(err);
  }
};

module.exports = { listar, obtener, solicitar, aceptar, iniciar, finalizar, cancelar };
