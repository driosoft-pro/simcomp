CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS infracciones (
  infraccion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(10) NOT NULL UNIQUE,
  descripcion TEXT NOT NULL,
  articulo_codigo VARCHAR(30) NOT NULL,
  tipo_sancion VARCHAR(20) NOT NULL,
  valor_multa DECIMAL(12,2) NOT NULL,
  dias_suspension INTEGER,
  aplica_descuento BOOLEAN NOT NULL DEFAULT FALSE,
  vigente BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deletet_at TIMESTAMP NULL,
  CONSTRAINT chk_infracciones_tipo_sancion CHECK (tipo_sancion IN ('MONETARIA', 'SUSPENSION_LICENCIA', 'INMOVILIZACION', 'MIXTA')),
  CONSTRAINT chk_infracciones_dias_suspension CHECK (dias_suspension IS NULL OR dias_suspension >= 0),
  CONSTRAINT chk_infracciones_valor_multa CHECK (valor_multa >= 0)
);

CREATE INDEX IF NOT EXISTS idx_infracciones_codigo ON infracciones(codigo);
CREATE INDEX IF NOT EXISTS idx_infracciones_vigente ON infracciones(vigente);

INSERT INTO infracciones (
  infraccion_id, codigo, descripcion, articulo_codigo, tipo_sancion, valor_multa, dias_suspension, aplica_descuento, vigente
) VALUES
  ('44444444-4444-4444-4444-444444444444', 'C001', 'Estacionar un vehículo en sitios prohibidos.', 'Ley 769/2002 Art. 131 C.1', 'MONETARIA', 650000.00, NULL, TRUE, TRUE),
  ('66666666-6666-6666-6666-666666666666', 'D002', 'Conducir sin portar licencia de conducción vigente.', 'Ley 769/2002 Art. 131 D.2', 'MIXTA', 1300000.00, 30, FALSE, TRUE)
ON CONFLICT (codigo) DO NOTHING;
