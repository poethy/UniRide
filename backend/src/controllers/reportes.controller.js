const svc = require('../services/reportes.service');
const { ok } = require('../utils/response');

const resumen = async (req, res, next) => {
  try { return ok(res, await svc.resumenGeneral()); }
  catch (err) { next(err); }
};

const porEstado = async (req, res, next) => {
  try { return ok(res, await svc.viajesPorEstado()); }
  catch (err) { next(err); }
};

const topConductores = async (req, res, next) => {
  try { return ok(res, await svc.topConductores(Number(req.query.limit) || 5)); }
  catch (err) { next(err); }
};

const actividad = async (req, res, next) => {
  try { return ok(res, await svc.actividadReciente(Number(req.query.dias) || 30)); }
  catch (err) { next(err); }
};

module.exports = { resumen, porEstado, topConductores, actividad };
