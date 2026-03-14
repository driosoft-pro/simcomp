CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS comparendos (
  comparendo_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_comparendo VARCHAR(20) NOT NULL UNIQUE,
  fecha_hora TIMESTAMP NOT NULL,
  automotor_id UUID NOT NULL,
  persona_id UUID NOT NULL,
  infraccion_id UUID NOT NULL,
  direccion_exacta TEXT NOT NULL,
  estado VARCHAR(25) NOT NULL DEFAULT 'CREADO',
  valor_multa DECIMAL(14,2) NOT NULL,
  observaciones TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_comparendos_estado CHECK (estado IN ('CREADO', 'PAGADO', 'ANULADO')),
  CONSTRAINT chk_comparendos_valor_multa CHECK (valor_multa >= 0)
);

CREATE INDEX IF NOT EXISTS idx_comparendos_numero_comparendo ON comparendos(numero_comparendo);
CREATE INDEX IF NOT EXISTS idx_comparendos_fecha_hora ON comparendos(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_comparendos_automotor_id ON comparendos(automotor_id);
CREATE INDEX IF NOT EXISTS idx_comparendos_persona_id ON comparendos(persona_id);
CREATE INDEX IF NOT EXISTS idx_comparendos_infraccion_id ON comparendos(infraccion_id);
CREATE INDEX IF NOT EXISTS idx_comparendos_estado ON comparendos(estado);

CREATE TABLE IF NOT EXISTS comparendo_transiciones_estado (
  transicion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comparendo_id UUID NOT NULL,
  estado_origen VARCHAR(25),
  estado_destino VARCHAR(25) NOT NULL,
  trigger_evento VARCHAR(120) NOT NULL,
  detalle TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_transiciones_estado_origen CHECK (estado_origen IS NULL OR estado_origen IN ('CREADO', 'PAGADO', 'ANULADO')),
  CONSTRAINT chk_transiciones_estado_destino CHECK (estado_destino IN ('CREADO', 'PAGADO', 'ANULADO'))
);

CREATE INDEX IF NOT EXISTS idx_transiciones_comparendo_id ON comparendo_transiciones_estado(comparendo_id);

INSERT INTO comparendos (
  comparendo_id, numero_comparendo, fecha_hora, automotor_id, persona_id, infraccion_id,
  direccion_exacta, estado, valor_multa, observaciones
) VALUES
  (
    '77777777-7777-7777-7777-777777777777',
    'CMP-2026-0001',
    CURRENT_TIMESTAMP,
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444444',
    'Calle 5 con Carrera 10, Cali, Valle del Cauca',
    'CREADO',
    650000.00,
    'Comparendo de ejemplo creado para pruebas iniciales.'
  )
ON CONFLICT (numero_comparendo) DO NOTHING;

INSERT INTO comparendo_transiciones_estado (
  comparendo_id, estado_origen, estado_destino, trigger_evento, detalle
) VALUES
  (
    '77777777-7777-7777-7777-777777777777',
    NULL,
    'CREADO',
    'REGISTRO_INICIAL',
    'Estado inicial del comparendo al momento de su creación.'
  )
ON CONFLICT DO NOTHING;
