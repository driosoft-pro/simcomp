CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS personas (
  persona_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_documento VARCHAR(3) NOT NULL,
  numero_documento VARCHAR(20) NOT NULL UNIQUE,
  primer_nombre VARCHAR(60) NOT NULL,
  segundo_nombre VARCHAR(60),
  primer_apellido VARCHAR(60) NOT NULL,
  segundo_apellido VARCHAR(60),
  direccion TEXT NOT NULL,
  telefono VARCHAR(15) NOT NULL,
  email VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_personas_tipo_documento CHECK (tipo_documento IN ('CC', 'CE', 'PAS', 'TI'))
);

CREATE INDEX IF NOT EXISTS idx_personas_numero_documento ON personas(numero_documento);
CREATE INDEX IF NOT EXISTS idx_personas_email ON personas(email);

CREATE TABLE IF NOT EXISTS licencias_conduccion (
  licencia_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID NOT NULL,
  numero_licencia VARCHAR(30) NOT NULL UNIQUE,
  categoria VARCHAR(5) NOT NULL,
  fecha_expedicion DATE NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  estado VARCHAR(15) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_licencias_persona FOREIGN KEY (persona_id) REFERENCES personas(persona_id) ON DELETE CASCADE,
  CONSTRAINT chk_licencias_categoria CHECK (categoria IN ('A1', 'A2', 'B1', 'B2', 'C1')),
  CONSTRAINT chk_licencias_estado CHECK (estado IN ('VIGENTE', 'SUSPENDIDA', 'VENCIDA', 'CANCELADA')),
  CONSTRAINT chk_licencias_fechas CHECK (fecha_vencimiento >= fecha_expedicion)
);

CREATE INDEX IF NOT EXISTS idx_licencias_persona_id ON licencias_conduccion(persona_id);
CREATE INDEX IF NOT EXISTS idx_licencias_numero_licencia ON licencias_conduccion(numero_licencia);

INSERT INTO personas (
  persona_id, tipo_documento, numero_documento, primer_nombre, segundo_nombre,
  primer_apellido, segundo_apellido, direccion, telefono, email
) VALUES
  ('11111111-1111-1111-1111-111111111111', 'CC', '100000001', 'Juan', 'Carlos', 'Perez', 'Lopez', 'Calle 10 # 15-20, Cali', '3001112233', 'juan.perez@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'CC', '100000002', 'Laura', NULL, 'Gomez', 'Riascos', 'Carrera 25 # 30-40, Palmira', '3004445566', 'laura.gomez@example.com')
ON CONFLICT (numero_documento) DO NOTHING;

INSERT INTO licencias_conduccion (
  licencia_id, persona_id, numero_licencia, categoria, fecha_expedicion, fecha_vencimiento, estado
) VALUES
  ('aaaaaaaa-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'LIC-10001', 'B1', '2024-01-10', '2029-01-10', 'VIGENTE'),
  ('aaaaaaaa-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'LIC-10002', 'A2', '2023-06-15', '2028-06-15', 'VIGENTE')
ON CONFLICT (numero_licencia) DO NOTHING;
