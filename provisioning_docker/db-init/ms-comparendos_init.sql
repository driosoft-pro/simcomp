CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_comparendo_enum') THEN
    CREATE TYPE estado_comparendo_enum AS ENUM ('PENDIENTE', 'PAGADO', 'ANULADO');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS comparendos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_comparendo VARCHAR(30) NOT NULL UNIQUE,
  ciudadano_documento VARCHAR(20) NOT NULL,
  ciudadano_nombre VARCHAR(200) NOT NULL,
  agente_documento VARCHAR(20) NOT NULL,
  agente_nombre VARCHAR(200) NOT NULL,
  placa_vehiculo VARCHAR(10) NOT NULL,
  infraccion_codigo VARCHAR(10) NOT NULL,
  infraccion_descripcion TEXT NOT NULL,
  valor_multa DECIMAL(12,2) NOT NULL,
  fecha_comparendo TIMESTAMP NOT NULL,
  lugar VARCHAR(200) NOT NULL,
  ciudad VARCHAR(100) NOT NULL,
  observaciones TEXT NULL,
  estado estado_comparendo_enum NOT NULL DEFAULT 'PENDIENTE',
  CONSTRAINT chk_comparendos_valor_multa CHECK (valor_multa > 0),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS historial_comparendos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comparendo_id UUID NOT NULL REFERENCES comparendos(id) ON DELETE CASCADE,
  estado_anterior estado_comparendo_enum NULL,
  estado_nuevo estado_comparendo_enum NOT NULL,
  observacion TEXT NULL,
  fecha_evento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);