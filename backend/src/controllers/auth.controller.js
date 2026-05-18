const authService = require('../services/auth.service');
const { ok, created, fail } = require('../utils/response');

const register = async (req, res, next) => {
  try {
    const usuario = await authService.register(req.body);
    return created(res, usuario);
  } catch (err) {
    if (err.status) return fail(res, err.message, err.status);
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    return ok(res, result);
  } catch (err) {
    if (err.status) return fail(res, err.message, err.status);
    next(err);
  }
};

const perfil = async (req, res, next) => {
  try {
    const data = await authService.perfil(req.user.id);
    return ok(res, data);
  } catch (err) {
    if (err.status) return fail(res, err.message, err.status);
    next(err);
  }
};

module.exports = { register, login, perfil };
