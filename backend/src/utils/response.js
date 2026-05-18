const ok = (res, data, statusCode = 200) =>
  res.status(statusCode).json({ ok: true, data });

const created = (res, data) => ok(res, data, 201);

const fail = (res, message, statusCode = 400) =>
  res.status(statusCode).json({ ok: false, message });

module.exports = { ok, created, fail };
