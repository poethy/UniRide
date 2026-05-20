const svc = require('../services/viajes.service');
const { ok, created, fail } = require('../utils/response');
const ubicacionesActivas = require('../utils/ubicaciones-store');
const pagination = require('../utils/pagination');

const listar = async (req, res, next) => {
  try {
    const { pasajero_id, conductor_id, estado } = req.query;
    const pag = pagination.parse(req.query);
    const result = await svc.listar({
      pasajero_id:  pasajero_id  ? Number(pasajero_id)  : undefined,
      conductor_id: conductor_id ? Number(conductor_id) : undefined,
      estado,
    }, pag);

    if (pag.paginated) {
      return ok(res, pagination.envelope({
        items: result.items, total: result.total, page: pag.page, perPage: pag.perPage,
      }));
    }
    return ok(res, result);
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

const actualizarUbicacion = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { lat, lng } = req.body;
    if (lat === undefined || lng === undefined)
      return fail(res, 'lat y lng son requeridos', 400);

    const viaje = await svc.obtener(id);
    if (viaje.conductor_id !== req.user.id)
      return fail(res, 'Solo el conductor puede actualizar la ubicación', 403);
    if (viaje.estado !== 'en_curso')
      return fail(res, 'El viaje no está en curso', 409);

    ubicacionesActivas.set(id, { lat: parseFloat(lat), lng: parseFloat(lng) });
    return ok(res, { updated: true });
  } catch (err) {
    if (err.status) return fail(res, err.message, err.status);
    next(err);
  }
};

const obtenerUbicacion = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const ubicacion = ubicacionesActivas.get(id);
    return ok(res, ubicacion);
  } catch (err) { next(err); }
};

module.exports = { listar, obtener, solicitar, aceptar, iniciar, finalizar, cancelar, actualizarUbicacion, obtenerUbicacion };
