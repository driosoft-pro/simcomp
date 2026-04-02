CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'clase_vehiculo_enum') THEN
    CREATE TYPE clase_vehiculo_enum AS ENUM ('AUTOMOVIL', 'MOTOCICLETA', 'CAMIONETA', 'CAMPERO', 'BUS', 'CAMION');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'servicio_vehiculo_enum') THEN
    CREATE TYPE servicio_vehiculo_enum AS ENUM ('PARTICULAR', 'PUBLICO', 'OFICIAL');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_vehiculo_enum') THEN
    CREATE TYPE estado_vehiculo_enum AS ENUM ('activo', 'inactivo', 'inmovilizado');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'condicion_vehiculo_enum') THEN
    CREATE TYPE condicion_vehiculo_enum AS ENUM ('LEGAL', 'REPORTADO_ROBO', 'RECUPERADO', 'EMBARGADO');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS automotores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placa VARCHAR(10) NOT NULL UNIQUE,
  vin VARCHAR(30) NOT NULL UNIQUE,
  numero_motor VARCHAR(30) NOT NULL UNIQUE,
  numero_chasis VARCHAR(30) NOT NULL UNIQUE,
  marca VARCHAR(50) NOT NULL,
  linea VARCHAR(50) NOT NULL,
  modelo INTEGER NOT NULL,
  color VARCHAR(30) NOT NULL,
  clase clase_vehiculo_enum NOT NULL,
  servicio servicio_vehiculo_enum NOT NULL DEFAULT 'PARTICULAR',
  propietario_documento VARCHAR(20) NOT NULL,
  propietario_nombre VARCHAR(200) NOT NULL,
  condicion condicion_vehiculo_enum NOT NULL DEFAULT 'LEGAL',
  estado estado_vehiculo_enum NOT NULL DEFAULT 'activo',
  CONSTRAINT chk_automotores_modelo CHECK (
    modelo BETWEEN 1950 AND EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER + 1
  ),
  CONSTRAINT chk_automotores_estado_condicion CHECK (
    (condicion = 'LEGAL' AND estado IN ('activo', 'inactivo', 'inmovilizado'))
    OR
    (condicion = 'EMBARGADO' AND estado IN ('activo', 'inactivo', 'inmovilizado'))
    OR
    (condicion = 'REPORTADO_ROBO' AND estado IN ('inactivo', 'inmovilizado'))
    OR
    (condicion = 'RECUPERADO' AND estado IN ('activo', 'inactivo', 'inmovilizado'))
  ),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);