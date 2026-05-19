import { describe, it, expect, beforeEach } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

describe('ubicaciones-store', () => {
  let store;

  beforeEach(() => {
    delete require.cache[require.resolve('../src/utils/ubicaciones-store')];
    process.env.UBICACION_TTL_MS = '50';
    store = require('../src/utils/ubicaciones-store');
  });

  it('set y get devuelven la ubicación con timestamp', () => {
    store.set(1, { lat: 10, lng: 20 });
    const got = store.get(1);
    expect(got.lat).toBe(10);
    expect(got.lng).toBe(20);
    expect(typeof got.timestamp).toBe('number');
  });

  it('expira por TTL', async () => {
    store.set(2, { lat: 1, lng: 2 });
    await new Promise((r) => setTimeout(r, 80));
    expect(store.get(2)).toBeNull();
  });

  it('delete elimina la entrada', () => {
    store.set(3, { lat: 1, lng: 2 });
    store.delete(3);
    expect(store.get(3)).toBeNull();
  });
});
