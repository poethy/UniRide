**UniRide — Contexto del Proyecto**

**Stack técnico:**
- Backend: Node.js + Express, patrón MVC estricto (controllers → services → routes)
- ORM: Prisma conectado a PostgreSQL en Supabase
- Auth: JWT + middleware propio + reCAPTCHA en login + bcrypt para contraseñas
- Frontend: Angular (SPA), módulos por dominio, Reactive Forms, SweetAlert2, FullCalendar, DataTables

**Base de datos:**
- PostgreSQL en Supabase, normalización 3NF, ya diseñada y lista
- Tablas: roles, permisos, usuarios, usuarios_roles, roles_permisos, vehiculos, rutas, puntos_ruta, rutas_favoritas, viajes, pagos, transacciones, calificaciones, notificaciones
- UUIDs para entidades principales, índices ya definidos, seeds de roles y permisos incluidos

**Decisiones de arquitectura:**
- Separación estricta: controladores solo reciben/responden, lógica en servicios, acceso a datos solo vía Prisma
- Sin pasarela de pagos real: se muestra QR o número de cuenta en pantalla, saldo manejado internamente en `saldo_billetera`
- Roles: administrador, conductor, pasajero — con tabla de permisos por módulo y acción
- Pagos: campo `metodo = 'billetera'` por defecto, sin integración externa

**Módulos funcionales (10, mínimo requerido: 8):**
usuarios, vehículos, rutas, viajes, pagos, calificaciones, notificaciones, reportes, dashboard, calendario

**Estructura backend:**
`src/controllers/` · `src/services/` · `src/routes/` · `src/middlewares/` · `src/utils/` · `src/validators/` · `prisma/schema.prisma`