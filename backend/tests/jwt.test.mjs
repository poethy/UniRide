import { describe, it, expect, beforeAll } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

describe('jwt utils', () => {
  let jwtUtil;
  beforeAll(() => {
    process.env.JWT_SECRET = 'test_secret_super_seguro_para_tests_123456';
    process.env.JWT_EXPIRES_IN = '1h';
    delete require.cache[require.resolve('../src/utils/jwt')];
    jwtUtil = require('../src/utils/jwt');
  });

  it('sign + verify roundtrip', () => {
    const token = jwtUtil.sign({ id: 1, email: 'a@b.c' });
    const decoded = jwtUtil.verify(token);
    expect(decoded.id).toBe(1);
    expect(decoded.email).toBe('a@b.c');
    expect(decoded.exp).toBeGreaterThan(decoded.iat);
  });

  it('verify lanza con token inválido', () => {
    expect(() => jwtUtil.verify('not.a.token')).toThrow();
  });
});
