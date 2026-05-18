-- ============================================================
--  UniRide — Script de Base de Datos PostgreSQL
--  Normalización: 3NF
--  Autor: Proyecto Final Universidad
-- ============================================================

-- ============================================================
-- 0. EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. ROLES Y PERMISOS
-- ============================================================

CREATE TABLE roles (
    id            SERIAL PRIMARY KEY,
    nombre        VARCHAR(50)  NOT NULL UNIQUE,
    descripcion   VARCHAR(255),
    activo        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE permisos (
    id            SERIAL PRIMARY KEY,
    modulo        VARCHAR(100) NOT NULL,
    accion        VARCHAR(50)  NOT NULL,  -- ver, crear, editar, eliminar
    descripcion   VARCHAR(255),
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE (modulo, accion)
);

CREATE TABLE roles_permisos (
    rol_id        INT NOT NULL REFERENCES roles(id)    ON DELETE CASCADE,
    permiso_id    INT NOT NULL REFERENCES permisos(id) ON DELETE CASCADE,
    PRIMARY KEY (rol_id, permiso_id)
);

-- ============================================================
-- 2. USUARIOS
-- ============================================================

CREATE TABLE usuarios (
    id               SERIAL PRIMARY KEY,
    uuid             UUID         NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    nombre           VARCHAR(100) NOT NULL,
    apellido         VARCHAR(100) NOT NULL,
    email            VARCHAR(150) NOT NULL UNIQUE,
    telefono         VARCHAR(20),
    password_hash    VARCHAR(255) NOT NULL,               -- bcrypt / Argon2
    foto_perfil      VARCHAR(500),
    codigo_estudiantil VARCHAR(50) UNIQUE,
    universidad      VARCHAR(150),
    saldo_billetera  NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    activo           BOOLEAN      NOT NULL DEFAULT TRUE,
    email_verificado BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Relación N:M usuarios <-> roles
CREATE TABLE usuarios_roles (
    usuario_id    INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    rol_id        INT NOT NULL REFERENCES roles(id)    ON DELETE CASCADE,
    asignado_en   TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (usuario_id, rol_id)
);

-- ============================================================
-- 3. VEHÍCULOS
-- ============================================================

CREATE TABLE vehiculos (
    id               SERIAL PRIMARY KEY,
    conductor_id     INT          NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    marca            VARCHAR(80)  NOT NULL,
    modelo           VARCHAR(80)  NOT NULL,
    anio             SMALLINT     NOT NULL,
    color            VARCHAR(50)  NOT NULL,
    placa            VARCHAR(20)  NOT NULL UNIQUE,
    capacidad_pasajeros SMALLINT  NOT NULL DEFAULT 3,
    foto_vehiculo    VARCHAR(500),
    soat_vence       DATE,
    tecnomecanica_vence DATE,
    verificado       BOOLEAN      NOT NULL DEFAULT FALSE,
    activo           BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. RUTAS
-- ============================================================

CREATE TABLE rutas (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(150),
    origen_descripcion  VARCHAR(255) NOT NULL,
    origen_lat          NUMERIC(10,7) NOT NULL,
    origen_lng          NUMERIC(10,7) NOT NULL,
    destino_descripcion VARCHAR(255) NOT NULL,
    destino_lat         NUMERIC(10,7) NOT NULL,
    destino_lng         NUMERIC(10,7) NOT NULL,
    distancia_km        NUMERIC(8,2),
    duracion_min        INT,
    created_at          TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE puntos_ruta (
    id          SERIAL PRIMARY KEY,
    ruta_id     INT           NOT NULL REFERENCES rutas(id) ON DELETE CASCADE,
    orden       SMALLINT      NOT NULL,
    descripcion VARCHAR(255),
    latitud     NUMERIC(10,7) NOT NULL,
    longitud    NUMERIC(10,7) NOT NULL
);

-- Rutas frecuentes guardadas por usuario
CREATE TABLE rutas_favoritas (
    id          SERIAL PRIMARY KEY,
    usuario_id  INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    ruta_id     INT NOT NULL REFERENCES rutas(id)    ON DELETE CASCADE,
    alias       VARCHAR(100),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (usuario_id, ruta_id)
);

-- ============================================================
-- 5. VIAJES
-- ============================================================

CREATE TABLE viajes (
    id               SERIAL PRIMARY KEY,
    uuid             UUID         NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    pasajero_id      INT          NOT NULL REFERENCES usuarios(id),
    conductor_id     INT          REFERENCES usuarios(id),
    vehiculo_id      INT          REFERENCES vehiculos(id),
    ruta_id          INT          NOT NULL REFERENCES rutas(id),
    estado           VARCHAR(30)  NOT NULL DEFAULT 'pendiente',
                     -- pendiente | aceptado | en_curso | finalizado | cancelado
    precio           NUMERIC(10,2),
    fecha_solicitud  TIMESTAMP    NOT NULL DEFAULT NOW(),
    fecha_inicio     TIMESTAMP,
    fecha_fin        TIMESTAMP,
    motivo_cancelacion VARCHAR(255),
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_estado CHECK (
        estado IN ('pendiente','aceptado','en_curso','finalizado','cancelado')
    ),
    CONSTRAINT ck_no_autoviaje CHECK (pasajero_id <> conductor_id)
);

-- ============================================================
-- 6. PAGOS Y TRANSACCIONES
-- ============================================================

CREATE TABLE pagos (
    id               SERIAL PRIMARY KEY,
    uuid             UUID         NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    viaje_id         INT          NOT NULL UNIQUE REFERENCES viajes(id),
    monto            NUMERIC(10,2) NOT NULL,
    estado           VARCHAR(30)  NOT NULL DEFAULT 'pendiente',
                     -- pendiente | completado | fallido | reembolsado
    metodo           VARCHAR(50)  NOT NULL DEFAULT 'billetera',
    referencia_ext   VARCHAR(255),          -- ref de pasarela externa
    pagado_en        TIMESTAMP,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_pago_estado CHECK (
        estado IN ('pendiente','completado','fallido','reembolsado')
    )
);

CREATE TABLE transacciones (
    id               SERIAL PRIMARY KEY,
    usuario_id       INT           NOT NULL REFERENCES usuarios(id),
    tipo             VARCHAR(30)   NOT NULL,
                     -- recarga | cobro_viaje | pago_viaje | reembolso | retiro
    monto            NUMERIC(10,2) NOT NULL,
    saldo_anterior   NUMERIC(12,2) NOT NULL,
    saldo_nuevo      NUMERIC(12,2) NOT NULL,
    descripcion      VARCHAR(255),
    pago_id          INT           REFERENCES pagos(id),
    created_at       TIMESTAMP     NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_transaccion_tipo CHECK (
        tipo IN ('recarga','cobro_viaje','pago_viaje','reembolso','retiro')
    )
);

-- ============================================================
-- 7. CALIFICACIONES
-- ============================================================

CREATE TABLE calificaciones (
    id               SERIAL PRIMARY KEY,
    viaje_id         INT          NOT NULL REFERENCES viajes(id),
    calificador_id   INT          NOT NULL REFERENCES usuarios(id),
    calificado_id    INT          NOT NULL REFERENCES usuarios(id),
    puntaje          SMALLINT     NOT NULL,
    comentario       VARCHAR(500),
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),

    UNIQUE (viaje_id, calificador_id),
    CONSTRAINT ck_puntaje CHECK (puntaje BETWEEN 1 AND 5),
    CONSTRAINT ck_no_autocal CHECK (calificador_id <> calificado_id)
);

-- ============================================================
-- 8. NOTIFICACIONES
-- ============================================================

CREATE TABLE notificaciones (
    id               SERIAL PRIMARY KEY,
    usuario_id       INT          NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo           VARCHAR(150) NOT NULL,
    mensaje          TEXT         NOT NULL,
    tipo             VARCHAR(30)  NOT NULL DEFAULT 'info',
                     -- info | exito | advertencia | error
    leida            BOOLEAN      NOT NULL DEFAULT FALSE,
    viaje_id         INT          REFERENCES viajes(id),
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_noti_tipo CHECK (
        tipo IN ('info','exito','advertencia','error')
    )
);

-- ============================================================
-- 9. ÍNDICES
-- ============================================================

-- Usuarios
CREATE INDEX idx_usuarios_email        ON usuarios(email);
CREATE INDEX idx_usuarios_activo       ON usuarios(activo);

-- Vehículos
CREATE INDEX idx_vehiculos_conductor   ON vehiculos(conductor_id);
CREATE INDEX idx_vehiculos_placa       ON vehiculos(placa);

-- Viajes
CREATE INDEX idx_viajes_pasajero       ON viajes(pasajero_id);
CREATE INDEX idx_viajes_conductor      ON viajes(conductor_id);
CREATE INDEX idx_viajes_estado         ON viajes(estado);
CREATE INDEX idx_viajes_fecha          ON viajes(fecha_solicitud);

-- Pagos
CREATE INDEX idx_pagos_viaje           ON pagos(viaje_id);
CREATE INDEX idx_pagos_estado          ON pagos(estado);

-- Transacciones
CREATE INDEX idx_transacciones_usuario ON transacciones(usuario_id);
CREATE INDEX idx_transacciones_fecha   ON transacciones(created_at);

-- Calificaciones
CREATE INDEX idx_calif_calificado      ON calificaciones(calificado_id);

-- Notificaciones
CREATE INDEX idx_noti_usuario          ON notificaciones(usuario_id);
CREATE INDEX idx_noti_leida            ON notificaciones(leida);

-- ============================================================
-- 10. DATOS INICIALES (Seeds)
-- ============================================================

-- Roles base
INSERT INTO roles (nombre, descripcion) VALUES
    ('administrador', 'Acceso total al sistema'),
    ('conductor',     'Estudiante con vehículo registrado'),
    ('pasajero',      'Estudiante que solicita viajes');

-- Permisos por módulo
INSERT INTO permisos (modulo, accion) VALUES
    ('usuarios',        'ver'),
    ('usuarios',        'crear'),
    ('usuarios',        'editar'),
    ('usuarios',        'eliminar'),
    ('vehiculos',       'ver'),
    ('vehiculos',       'crear'),
    ('vehiculos',       'editar'),
    ('vehiculos',       'eliminar'),
    ('viajes',          'ver'),
    ('viajes',          'crear'),
    ('viajes',          'editar'),
    ('viajes',          'eliminar'),
    ('pagos',           'ver'),
    ('pagos',           'crear'),
    ('rutas',           'ver'),
    ('rutas',           'crear'),
    ('rutas',           'editar'),
    ('rutas',           'eliminar'),
    ('calificaciones',  'ver'),
    ('calificaciones',  'crear'),
    ('notificaciones',  'ver'),
    ('notificaciones',  'editar'),
    ('reportes',        'ver');

-- Administrador tiene todos los permisos
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 1, id FROM permisos;

-- Conductor: ver/crear/editar viajes, ver pagos, rutas CRUD, calificaciones, notificaciones
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 2, id FROM permisos
WHERE (modulo = 'viajes'         AND accion IN ('ver','editar'))
   OR (modulo = 'pagos'          AND accion = 'ver')
   OR (modulo = 'rutas'          AND accion IN ('ver','crear','editar'))
   OR (modulo = 'calificaciones' AND accion IN ('ver','crear'))
   OR (modulo = 'notificaciones' AND accion IN ('ver','editar'))
   OR (modulo = 'vehiculos'      AND accion IN ('ver','crear','editar'));

-- Pasajero: crear/ver viajes, pagos, rutas, calificaciones, notificaciones
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 3, id FROM permisos
WHERE (modulo = 'viajes'         AND accion IN ('ver','crear'))
   OR (modulo = 'pagos'          AND accion IN ('ver','crear'))
   OR (modulo = 'rutas'          AND accion IN ('ver','crear'))
   OR (modulo = 'calificaciones' AND accion IN ('ver','crear'))
   OR (modulo = 'notificaciones' AND accion IN ('ver','editar'));

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
