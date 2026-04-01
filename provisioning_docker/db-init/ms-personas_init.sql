CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_documento_enum') THEN
    CREATE TYPE tipo_documento_enum AS ENUM ('CC', 'CE', 'TI', 'PASAPORTE');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'genero_enum') THEN
    CREATE TYPE genero_enum AS ENUM ('M', 'F', 'O');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_persona_enum') THEN
    CREATE TYPE estado_persona_enum AS ENUM ('activo', 'inactivo');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'categoria_licencia_enum') THEN
    CREATE TYPE categoria_licencia_enum AS ENUM ('A1', 'A2', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_licencia_enum') THEN
    CREATE TYPE estado_licencia_enum AS ENUM ('vigente', 'suspendida', 'vencida', 'cancelada');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_documento tipo_documento_enum NOT NULL DEFAULT 'CC',
  numero_documento VARCHAR(20) NOT NULL UNIQUE,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  genero genero_enum NOT NULL,
  direccion VARCHAR(200) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  estado estado_persona_enum NOT NULL DEFAULT 'activo',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS licencias_conduccion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  numero_licencia VARCHAR(30) NOT NULL UNIQUE,
  categoria categoria_licencia_enum NOT NULL,
  fecha_expedicion DATE NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  estado estado_licencia_enum NOT NULL,
  observaciones TEXT NULL,
  CONSTRAINT chk_licencias_fechas CHECK (fecha_vencimiento > fecha_expedicion),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);