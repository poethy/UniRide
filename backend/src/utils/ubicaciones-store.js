/**
 * Store de ubicaciones activas de viajes.
 *
 * Implementación actual: Map en memoria con TTL.
 * Limitación: no funciona con múltiples réplicas (Railway autoscale). Para producción
 * real, reemplazar con Redis (mismo contrato: set/get/delete + TTL).
 *
 * Contrato:
 *   set(viajeId, { lat, lng })   → guarda timestamp = now
 *   get(viajeId)                 → { lat, lng, timestamp } | null
 *   delete(viajeId)              → void
 */
const TTL_MS = parseInt(process.env.UBICACION_TTL_MS || '60000', 10);
const CLEANUP_INTERVAL_MS = 60_000;

const store = new Map();

function set(viajeId, { lat, lng }) {
  store.set(viajeId, { lat, lng, timestamp: Date.now() });
}

function get(viajeId) {
  const entry = store.get(viajeId);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > TTL_MS) {
    store.delete(viajeId);
    return null;
  }
  return entry;
}

function del(viajeId) {
  store.delete(viajeId);
}

// Limpieza periódica para evitar fugas de memoria con viajes huérfanos.
const interval = setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of store) {
    if (now - entry.timestamp > TTL_MS) store.delete(id);
  }
}, CLEANUP_INTERVAL_MS);
interval.unref();

module.exports = { set, get, delete: del };
