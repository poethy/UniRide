# UniRide

Plataforma de carpooling universitario. Monorepo con dos paquetes:

- `backend/` — API REST en Node.js + Express + Prisma (PostgreSQL).
- `frontend/` — SPA en Angular 21 + Tailwind.

## Stack

| Capa | Tecnología |
| --- | --- |
| API | Express 5, Prisma 5, JWT, bcrypt, helmet, express-rate-limit, pino |
| DB | PostgreSQL (Supabase) |
| Web | Angular 21, Tailwind, Leaflet, FullCalendar, SweetAlert2 |
| Deploy | Backend → Railway · Frontend → Vercel |

## Requisitos

- Node.js 20+
- npm 10+
- PostgreSQL accesible (Supabase, local, etc.)

## Setup

### Backend

```bash
cd backend
cp .env.example .env   # editar valores
npm install
npx prisma migrate deploy    # o `npx prisma db push` si trabajas sin migraciones
npm run seed                 # roles, permisos y admin inicial
npm run dev
```

Variables de entorno relevantes (ver `backend/.env.example`):

- `DATABASE_URL` — string de conexión Postgres
- `JWT_SECRET` — secreto JWT (≥ 32 caracteres)
- `JWT_EXPIRES_IN` — default `7d`
- `ALLOWED_ORIGINS` — orígenes CORS, coma-separados
- `RECAPTCHA_SECRET` — opcional en dev, requerido en prod
- `LOG_LEVEL` — `debug` | `info` | `warn` | `error`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — para el seed

Scripts:

```bash
npm run dev         # nodemon
npm start           # producción
npm run lint        # ESLint
npm test            # Vitest
npm run seed        # poblar roles/permisos/admin
npm run prisma:migrate
```

### Frontend

```bash
cd frontend
npm install
npm start   # ng serve en http://localhost:4200
```

Configurar la URL de la API en `frontend/src/environments/environment.ts`.

## Estructura del backend

```
backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── src/
│   ├── app.js
│   ├── controllers/
│   ├── services/        ← lógica de negocio
│   ├── routes/
│   ├── middlewares/     ← auth, permisos, recaptcha, errores
│   ├── validators/      ← express-validator por módulo
│   └── utils/           ← logger, prisma, jwt, paginación, ubicaciones-store
├── tests/               ← Vitest (.mjs)
└── server.js            ← entry point, fail-fast + graceful shutdown
```

## Healthcheck

`GET /health` y `GET /api/health` devuelven `{ ok: true, status: 'up' }`. Útil para Railway.

## Paginación

Endpoints de listado (`/api/viajes`, `/api/pagos`, `/api/pagos/transacciones`) aceptan `?page=&per_page=` opcionales. Cuando se incluyen, la respuesta cambia a `{ items, total, page, per_page, total_pages }`. Sin esos parámetros se retorna el array tradicional (con cap defensivo de 500).

## Seguridad

- JWT con expiración configurable
- Rate limit en `/api/auth/*` (20 req / 15 min por IP)
- reCAPTCHA opcional vía `RECAPTCHA_SECRET`
- Helmet + CORS estricto por allowlist
- Errores 5xx sanitizados en producción
- bcrypt cost 10 (subir a 12+ en producción)

## CI

Workflow en `.github/workflows/ci.yml`: lint + test en backend y build del frontend en cada push/PR a `main`.

## Despliegue

- **Backend (Railway):** apuntar al directorio `backend/`. Configurar las env vars del `.env.example`. Railway corre `npm install` (postinstall = `prisma generate`) y luego `npm start`. Para aplicar migraciones añade un build step: `npm run prisma:migrate`.
- **Frontend (Vercel):** apuntar al directorio `frontend/`. Build command: `npm run build`. Output: `dist/frontend/browser`. Ver `frontend/vercel.json`.

## Contexto del proyecto

Ver [`docs/CONTEXT.md`](docs/CONTEXT.md) para detalles funcionales y de modelado.
