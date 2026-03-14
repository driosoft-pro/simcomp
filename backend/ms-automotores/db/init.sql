CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS automotores (
  automotor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placa VARCHAR(8) NOT NULL UNIQUE,
  tipo VARCHAR(20) NOT NULL,
  marca VARCHAR(50) NOT NULL,
  modelo VARCHAR(50) NOT NULL,
  anio SMALLINT NOT NULL,
  color VARCHAR(30) NOT NULL,
  cilindraje INTEGER NOT NULL,
  estado VARCHAR(50) NOT NULL,
  propietario_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_automotores_tipo CHECK (tipo IN ('MOTO', 'CARRO', 'BUS', 'BUSETA', 'CAMION', 'TRACTOMULA', 'CUATRIMOTO')),
  CONSTRAINT chk_automotores_estado CHECK (estado IN ('LEGAL', 'REPORTADO_ROBO', 'RECUPERADO', 'EMBARGADO')),
  CONSTRAINT chk_automotores_anio CHECK (anio >= 1900 AND anio <= 2100),
  CONSTRAINT chk_automotores_cilindraje CHECK (cilindraje > 0)
);

CREATE INDEX IF NOT EXISTS idx_automotores_placa ON automotores(placa);
CREATE INDEX IF NOT EXISTS idx_automotores_propietario_id ON automotores(propietario_id);
CREATE INDEX IF NOT EXISTS idx_automotores_estado ON automotores(estado);

INSERT INTO automotores (
  automotor_id, placa, tipo, marca, modelo, anio, color, cilindraje, estado, propietario_id
) VALUES
  ('33333333-3333-3333-3333-333333333333', 'ABC123', 'CARRO', 'Mazda', '3 Touring', 2020, 'Rojo', 2000, 'LEGAL', '11111111-1111-1111-1111-111111111111'),
  ('55555555-5555-5555-5555-555555555555', 'XYZ98A', 'MOTO', 'Yamaha', 'FZ 2.0', 2022, 'Negro', 150, 'LEGAL', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (placa) DO NOTHING;
