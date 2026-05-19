const svc = require('../services/pagos.service');
const { ok, created, fail } = require('../utils/response');
const pagination = require('../utils/pagination');

const paginatedOk = (res, result, pag) => {
  if (pag.paginated) {
    return ok(res, pagination.envelope({
      items: result.items, total: result.total, page: pag.page, perPage: pag.perPage,
    }));
  }
  return ok(res, result);
};

const listar = async (req, res, next) => {
  try {
    const pag = pagination.parse(req.query);
    return paginatedOk(res, await svc.listarPorUsuario(req.user.id, pag), pag);
  } catch (err) { next(err); }
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
  try {
    const pag = pagination.parse(req.query);
    return paginatedOk(res, await svc.historialTransacciones(req.user.id, pag), pag);
  } catch (err) { next(err); }
};

module.exports = { listar, obtener, recargar, transacciones };
