const svc = require('../services/rutas.service');
const { ok, created, fail } = require('../utils/response');

const listar = async (req, res, next) => {
  try { return ok(res, await svc.listar()); }
  catch (err) { next(err); }
};

const obtener = async (req, res, next) => {
  try { return ok(res, await svc.obtener(Number(req.params.id))); }
  catch (err) {
    if (err.status) return fail(res, err.message, err.status);
    next(err);
  }
};

const crear = async (req, res, next) => {
  try { return created(res, await svc.crear(req.body)); }
  catch (err) { next(err); }
};

const actualizar = async (req, res, next) => {
  try { return ok(res, await svc.actualizar(Number(req.params.id), req.body)); }
  catch (err) { next(err); }
};

const eliminar = async (req, res, next) => {
  try {
    await svc.eliminar(Number(req.params.id));
    return ok(res, { message: 'Ruta eliminada' });
  } catch (err) { next(err); }
};

const favoritos = async (req, res, next) => {
  try { return ok(res, await svc.favoritos(req.user.id)); }
  catch (err) { next(err); }
};

const agregarFavorito = async (req, res, next) => {
  try {
    return created(res, await svc.agregarFavorito(req.user.id, req.body.ruta_id, req.body.alias));
  } catch (err) { next(err); }
};

const quitarFavorito = async (req, res, next) => {
  try {
    await svc.quitarFavorito(req.user.id, Number(req.params.ruta_id));
    return ok(res, { message: 'Favorito eliminado' });
  } catch (err) { next(err); }
};

module.exports = { listar, obtener, crear, actualizar, eliminar, favoritos, agregarFavorito, quitarFavorito };
