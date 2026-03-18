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
  infraccion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(10) NOT NULL UNIQUE,
  descripcion TEXT NOT NULL,
  articulo_codigo VARCHAR(30) NOT NULL,
  tipo_sancion tipo_sancion_enum NOT NULL,
  valor_multa DECIMAL(12,2) NOT NULL,
  dias_suspension INTEGER NULL,
  estado estado_infraccion_enum NOT NULL DEFAULT 'activo',
  aplica_descuento BOOLEAN DEFAULT FALSE,
  vigente BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

TRUNCATE TABLE infracciones RESTART IDENTITY CASCADE;

INSERT INTO infracciones (
  infraccion_id, codigo, descripcion, articulo_codigo, tipo_sancion,
  valor_multa, dias_suspension, estado, aplica_descuento, vigente, created_at, updated_at, deleted_at
) VALUES
('8b8e53d8-76c1-4f0c-a5d8-25eea52b2001', 'C01', 'Presentar licencia de conducción vencida.', 'ART-131-C01', 'MONETARIA', 650000.00, NULL, 'activo', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('8b8e53d8-76c1-4f0c-a5d8-25eea52b2002', 'C02', 'No portar la licencia de conducción.', 'ART-131-C02', 'MONETARIA', 420000.00, NULL, 'activo', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('8b8e53d8-76c1-4f0c-a5d8-25eea52b2003', 'C03', 'Estacionar en sitio prohibido.', 'ART-131-C03', 'MONETARIA', 520000.00, NULL, 'activo', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('8b8e53d8-76c1-4f0c-a5d8-25eea52b2004', 'C04', 'No utilizar el cinturón de seguridad.', 'ART-131-C04', 'MONETARIA', 570000.00, NULL, 'activo', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('8b8e53d8-76c1-4f0c-a5d8-25eea52b2005', 'C05', 'Conducir sin revisión técnico-mecánica vigente.', 'ART-131-C05', 'MONETARIA', 780000.00, NULL, 'activo', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('8b8e53d8-76c1-4f0c-a5d8-25eea52b2006', 'C06', 'Transitar sin SOAT vigente.', 'ART-131-C06', 'INMOVILIZACION', 1160000.00, NULL, 'activo', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('8b8e53d8-76c1-4f0c-a5d8-25eea52b2007', 'C07', 'Conducir usando dispositivos móviles.', 'ART-131-C07', 'MONETARIA', 650000.00, NULL, 'activo', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('8b8e53d8-76c1-4f0c-a5d8-25eea52b2008', 'C08', 'No respetar la luz roja del semáforo.', 'ART-131-C08', 'MONETARIA', 1300000.00, NULL, 'activo', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('8b8e53d8-76c1-4f0c-a5d8-25eea52b2009', 'C09', 'Exceder los límites de velocidad permitidos.', 'ART-131-C09', 'MONETARIA', 900000.00, NULL, 'activo', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('8b8e53d8-76c1-4f0c-a5d8-25eea52b2010', 'C10', 'Realizar maniobra peligrosa en vía pública.', 'ART-131-C10', 'MONETARIA', 850000.00, NULL, 'activo', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('8b8e53d8-76c1-4f0c-a5d8-25eea52b2011', 'D01', 'Conducir en estado de embriaguez grado 0.', 'ART-152-D01', 'MIXTA', 3480000.00, 12, 'activo', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('8b8e53d8-76c1-4f0c-a5d8-25eea52b2012', 'D02', 'Conducir en estado de embriaguez grado 1.', 'ART-152-D02', 'MIXTA', 6960000.00, 24, 'activo', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('8b8e53d8-76c1-4f0c-a5d8-25eea52b2013', 'D03', 'Conducir sin haber obtenido licencia.', 'ART-152-D03', 'MONETARIA', 1300000.00, NULL, 'activo', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('8b8e53d8-76c1-4f0c-a5d8-25eea52b2014', 'D04', 'Transportar pasajeros excediendo la capacidad.', 'ART-152-D04', 'MONETARIA', 980000.00, NULL, 'activo', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('8b8e53d8-76c1-4f0c-a5d8-25eea52b2015', 'D05', 'Adelantar en zona prohibida.', 'ART-152-D05', 'MONETARIA', 1040000.00, NULL, 'activo', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('8b8e53d8-76c1-4f0c-a5d8-25eea52b2016', 'D06', 'Invadir carril exclusivo o preferencial.', 'ART-152-D06', 'MONETARIA', 920000.00, NULL, 'activo', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('8b8e53d8-76c1-4f0c-a5d8-25eea52b2017', 'D07', 'Circular en contravía.', 'ART-152-D07', 'MONETARIA', 1300000.00, NULL, 'activo', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('8b8e53d8-76c1-4f0c-a5d8-25eea52b2018', 'D08', 'No ceder el paso al peatón.', 'ART-152-D08', 'MONETARIA', 780000.00, NULL, 'activo', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('8b8e53d8-76c1-4f0c-a5d8-25eea52b2019', 'D09', 'Conducir vehículo con placas adulteradas.', 'ART-152-D09', 'INMOVILIZACION', 1740000.00, NULL, 'activo', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('8b8e53d8-76c1-4f0c-a5d8-25eea52b2020', 'D10', 'Negarse a realizar prueba de alcoholemia.', 'ART-152-D10', 'MIXTA', 13920000.00, 36, 'activo', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);