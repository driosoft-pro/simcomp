CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_sancion_enum') THEN
    CREATE TYPE tipo_sancion_enum AS ENUM ('MONETARIA', 'SUSPENSION_LICENCIA', 'INMOVILIZACION', 'MIXTA');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_infraccion_enum') THEN
    CREATE TYPE estado_infraccion_enum AS ENUM ('activo', 'inactivo');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS infracciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(10) NOT NULL UNIQUE,
  descripcion TEXT NOT NULL,
  articulo_codigo VARCHAR(30) NOT NULL,
  tipo_sancion tipo_sancion_enum NOT NULL,
  valor_multa DECIMAL(12,2) NOT NULL,
  dias_suspension INTEGER NULL,
  estado estado_infraccion_enum NOT NULL DEFAULT 'activo',
  aplica_descuento BOOLEAN DEFAULT FALSE,
  vigente BOOLEAN DEFAULT TRUE,
  CONSTRAINT chk_infracciones_valor_multa CHECK (valor_multa > 0),
  CONSTRAINT chk_infracciones_dias_suspension CHECK (
    dias_suspension IS NULL OR dias_suspension > 0
  ),
  CONSTRAINT chk_infracciones_estado_vigente CHECK (
    (estado = 'activo' AND vigente = TRUE)
    OR
    (estado = 'inactivo' AND vigente = FALSE)
  ),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);