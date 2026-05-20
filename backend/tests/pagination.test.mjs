import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pag = require('../src/utils/pagination');

describe('pagination.parse', () => {
  it('detecta query sin paginación y aplica cap defensivo', () => {
    const r = pag.parse({});
    expect(r.paginated).toBe(false);
    expect(r.take).toBe(pag.MAX_TAKE);
    expect(r.skip).toBe(0);
  });

  it('paginated=true cuando page o per_page presentes', () => {
    const r = pag.parse({ page: '2', per_page: '10' });
    expect(r.paginated).toBe(true);
    expect(r.page).toBe(2);
    expect(r.perPage).toBe(10);
    expect(r.skip).toBe(10);
    expect(r.take).toBe(10);
  });

  it('capea per_page a MAX_PER_PAGE', () => {
    const r = pag.parse({ per_page: '9999' });
    expect(r.perPage).toBe(pag.MAX_PER_PAGE);
  });

  it('valores inválidos colapsan a defaults seguros', () => {
    const r = pag.parse({ page: '-3', per_page: 'abc' });
    expect(r.page).toBe(1);
    expect(r.perPage).toBe(pag.DEFAULT_PER_PAGE);
  });
});

describe('pagination.envelope', () => {
  it('calcula total_pages correctamente', () => {
    const e = pag.envelope({ items: [1, 2, 3], total: 23, page: 1, perPage: 10 });
    expect(e.total).toBe(23);
    expect(e.total_pages).toBe(3);
    expect(e.page).toBe(1);
    expect(e.per_page).toBe(10);
  });
});
