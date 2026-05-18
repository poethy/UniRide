const svc = require('../services/usuarios.service');
const { ok, fail } = require('../utils/response');

const listar = async (req, res, next) => {
  try { return ok(res, await svc.listar()); }
  catch (err) { next(err); }
};

const obtener = async (req, res, next) => {
  try {
    return ok(res, await svc.obtener(Number(req.params.id)));
  } catch (err) {
    if (err.status) return fail(res, err.message, err.status);
    next(err);
  }
};

const actualizar = async (req, res, next) => {
  try {
    return ok(res, await svc.actualizar(Number(req.params.id), req.body));
  } catch (err) { next(err); }
};

const cambiarPassword = async (req, res, next) => {
  try {
    await svc.cambiarPassword(req.user.id, req.body);
    return ok(res, { message: 'Contraseña actualizada' });
  } catch (err) {
    if (err.status) return fail(res, err.message, err.status);
    next(err);
  }
};

const desactivar = async (req, res, next) => {
  try {
    return ok(res, await svc.desactivar(Number(req.params.id)));
  } catch (err) { next(err); }
};

const asignarRol = async (req, res, next) => {
  try {
    await svc.asignarRol(Number(req.params.id), req.body.rol_id);
    return ok(res, { message: 'Rol asignado' });
  } catch (err) { next(err); }
};

module.exports = { listar, obtener, actualizar, cambiarPassword, desactivar, asignarRol };
