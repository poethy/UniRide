-- Migración manual: constraints de integridad de dominio.
--
-- Aplicar con:
--   psql "$DATABASE_URL" -f prisma/migrations/manual_constraints.sql
--
-- Estas constraints NO están modeladas en schema.prisma porque Prisma no soporta
-- CHECK constraints declarativos. Se aplican una sola vez a la DB existente.
-- Los índices @@index sí están en schema.prisma y se aplican con `prisma migrate`.

-- 1. saldo_billetera nunca negativo
ALTER TABLE usuarios
  DROP CONSTRAINT IF EXISTS chk_usuarios_saldo_no_negativo;
ALTER TABLE usuarios
  ADD CONSTRAINT chk_usuarios_saldo_no_negativo
  CHECK (saldo_billetera >= 0);

-- 2. Estados de viaje válidos (enum-like)
ALTER TABLE viajes
  DROP CONSTRAINT IF EXISTS chk_viajes_estado;
ALTER TABLE viajes
  ADD CONSTRAINT chk_viajes_estado
  CHECK (estado IN ('pendiente', 'aceptado', 'en_curso', 'finalizado', 'cancelado'));

-- 3. Estados de pago válidos
ALTER TABLE pagos
  DROP CONSTRAINT IF EXISTS chk_pagos_estado;
ALTER TABLE pagos
  ADD CONSTRAINT chk_pagos_estado
  CHECK (estado IN ('pendiente', 'completado', 'fallido', 'reembolsado'));

-- 4. Método de pago válido
ALTER TABLE pagos
  DROP CONSTRAINT IF EXISTS chk_pagos_metodo;
ALTER TABLE pagos
  ADD CONSTRAINT chk_pagos_metodo
  CHECK (metodo IN ('billetera', 'efectivo', 'transferencia', 'qr'));

-- 5. Tipo de transacción válido (debe coincidir con uniride database.sql)
ALTER TABLE transacciones
  DROP CONSTRAINT IF EXISTS chk_transacciones_tipo;
ALTER TABLE transacciones
  ADD CONSTRAINT chk_transacciones_tipo
  CHECK (tipo IN ('recarga', 'pago_viaje', 'cobro_viaje', 'reembolso', 'retiro'));

-- 6. Puntaje de calificación entre 1 y 5
ALTER TABLE calificaciones
  DROP CONSTRAINT IF EXISTS chk_calificaciones_puntaje;
ALTER TABLE calificaciones
  ADD CONSTRAINT chk_calificaciones_puntaje
  CHECK (puntaje BETWEEN 1 AND 5);

-- 7. Monto positivo en pagos y transacciones
ALTER TABLE pagos
  DROP CONSTRAINT IF EXISTS chk_pagos_monto_positivo;
ALTER TABLE pagos
  ADD CONSTRAINT chk_pagos_monto_positivo
  CHECK (monto >= 0);

ALTER TABLE transacciones
  DROP CONSTRAINT IF EXISTS chk_transacciones_monto_positivo;
ALTER TABLE transacciones
  ADD CONSTRAINT chk_transacciones_monto_positivo
  CHECK (monto >= 0);

-- Nota: Si se desea reforzar a nivel de tipo, considerar migrar las columnas
-- `estado`, `metodo`, `tipo` a tipos ENUM nativos de Postgres en una migración
-- separada (requiere DROP+CREATE TYPE y migración de datos).
