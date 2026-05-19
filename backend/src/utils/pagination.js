/**
 * Helpers de paginación. Mantiene compatibilidad con respuestas no paginadas:
 *
 *   parse(query) → { page, perPage, skip, take, paginated }
 *
 * Si `page` o `per_page` están presentes en query, `paginated = true` y el caller
 * debe envolver la respuesta. Si no, se aplica un cap defensivo (MAX_TAKE) para
 * evitar payloads gigantes.
 */
const DEFAULT_PER_PAGE = 20;
const MAX_PER_PAGE = 100;
const MAX_TAKE = 500;

function parse(query = {}) {
  const hasPage = query.page !== undefined || query.per_page !== undefined;
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const perPage = Math.min(
    MAX_PER_PAGE,
    Math.max(1, parseInt(query.per_page, 10) || DEFAULT_PER_PAGE)
  );

  if (hasPage) {
    return { page, perPage, skip: (page - 1) * perPage, take: perPage, paginated: true };
  }
  return { page: 1, perPage: MAX_TAKE, skip: 0, take: MAX_TAKE, paginated: false };
}

function envelope({ items, total, page, perPage }) {
  return {
    items,
    total,
    page,
    per_page: perPage,
    total_pages: perPage > 0 ? Math.ceil(total / perPage) : 0,
  };
}

module.exports = { parse, envelope, DEFAULT_PER_PAGE, MAX_PER_PAGE, MAX_TAKE };
