const svc = require('../services/pagos.service');
const { ok, created, fail } = require('../utils/response');

const listar = async (req, res, next) => {
  try { return ok(res, await svc.listarPorUsuario(req.user.id)); }
  catch (err) { next(err); }
};

const obtener = async (req, res, next) => {
  try { return ok(res, await svc.obtener(Number(req.params.id))); }
  catch (err) {
    if (err.status) return fail(res, err.message, err.status);
    next(err);
  }
};

const recargar = async (req, res, next) => {
  try {
    return created(res, await svc.recargarBilletera(req.user.id, Number(req.body.monto)));
  } catch (err) {
    if (err.status) return fail(res, err.message, err.status);
    next(err);
  }
};

const transacciones = async (req, res, next) => {
  try { return ok(res, await svc.historialTransacciones(req.user.id)); }
  catch (err) { next(err); }
};

module.exports = { listar, obtener, recargar, transacciones };
