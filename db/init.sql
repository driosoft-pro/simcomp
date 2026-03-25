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
  CONSTRAINT chk_infracciones_dias_suspension CHECK (dias_suspension IS NULL OR dias_suspension > 0),
  CONSTRAINT chk_infracciones_estado_vigente CHECK (
    (estado = 'activo' AND vigente = TRUE)
    OR
    (estado = 'inactivo' AND vigente = FALSE)
  ),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

TRUNCATE TABLE infracciones RESTART IDENTITY CASCADE;

INSERT INTO infracciones (id, codigo, descripcion, articulo_codigo, tipo_sancion, valor_multa, dias_suspension, estado, aplica_descuento, vigente, created_at, updated_at, deleted_at) VALUES
('3752ff7b-ae9f-4fe2-b2e1-9656e59de735', 'C01', 'Transitar por sitios restringidos o en horas prohibidas', 'ART-C01', 'MONETARIA', 604100.00, NULL, 'activo', TRUE, TRUE, '2026-03-25 15:12:00', '2026-03-25 15:12:00', NULL),
('012a0acc-10a6-44d6-a18b-f5c26c4ddb38', 'C02', 'Estacionar en sitios prohibidos', 'ART-C02', 'MONETARIA', 604100.00, NULL, 'activo', TRUE, TRUE, '2026-03-25 15:12:00', '2026-03-25 15:12:00', NULL),
('6ad3989f-9dce-4e6d-8cc7-e9e0e8bf5a9e', 'C03', 'No portar licencia de conducción', 'ART-C03', 'MIXTA', 604100.00, 90, 'activo', TRUE, TRUE, '2026-03-25 15:12:00', '2026-03-25 15:12:00', NULL),
('94b208cd-02bd-44c6-b4de-06522b6f868e', 'C04', 'No utilizar cinturón de seguridad', 'ART-C04', 'MONETARIA', 604100.00, NULL, 'activo', TRUE, TRUE, '2026-03-25 15:12:00', '2026-03-25 15:12:00', NULL),
('dddb5c26-64dd-426f-97dc-abfb84fb46e8', 'C05', 'No realizar revisión tecnicomecánica', 'ART-C05', 'MONETARIA', 604100.00, NULL, 'activo', TRUE, TRUE, '2026-03-25 15:12:00', '2026-03-25 15:12:00', NULL),
('96495645-f9e5-446a-8422-5f677598c030', 'C06', 'Conducir sin SOAT', 'ART-C06', 'MIXTA', 1208200.00, 30, 'activo', TRUE, TRUE, '2026-03-25 15:12:00', '2026-03-25 15:12:00', NULL),
('f296b053-a6a1-41d9-b2d7-a594d9faede2', 'C07', 'Transitar con luces apagadas', 'ART-C07', 'MONETARIA', 604100.00, NULL, 'activo', TRUE, TRUE, '2026-03-25 15:12:00', '2026-03-25 15:12:00', NULL),
('21f85c15-a805-4171-b7c0-dc39e938e14f', 'C08', 'Bloquear intersección o calzada', 'ART-C08', 'MIXTA', 604100.00, NULL, 'activo', TRUE, TRUE, '2026-03-25 15:12:00', '2026-03-25 15:12:00', NULL),
('db812a94-e3f9-4a27-a0d2-511feea7cf3e', 'C09', 'Conducir con exceso de velocidad', 'ART-C09', 'MONETARIA', 1208200.00, NULL, 'activo', TRUE, TRUE, '2026-03-25 15:12:00', '2026-03-25 15:12:00', NULL),
('ea9e33c5-2292-4595-af47-c659b5fb4967', 'C10', 'No respetar señal de pare o semáforo', 'ART-C10', 'MIXTA', 1208200.00, 180, 'activo', TRUE, TRUE, '2026-03-25 15:12:00', '2026-03-25 15:12:00', NULL),
('501deb8a-6541-47ab-9e8c-aa5608069762', 'D01', 'Conducir en estado de embriaguez grado 0', 'ART-D01', 'MONETARIA', 2416400.00, NULL, 'activo', FALSE, TRUE, '2026-03-25 15:12:00', '2026-03-25 15:12:00', NULL),
('e1c5e600-b012-4b7e-87a8-c616692ada85', 'D02', 'Conducir en estado de embriaguez grado 1', 'ART-D02', 'MONETARIA', 4832800.00, NULL, 'activo', FALSE, TRUE, '2026-03-25 15:12:00', '2026-03-25 15:12:00', NULL),
('71ae2087-ccfb-4cca-a301-3cab8d1c9d01', 'D03', 'Conducir en estado de embriaguez grado 2', 'ART-D03', 'MONETARIA', 9665600.00, NULL, 'inactivo', FALSE, FALSE, '2026-03-25 15:12:00', '2026-03-25 15:12:00', NULL),
('0d245ab3-a33d-4771-a90c-36ff3605120b', 'D04', 'Conducir en estado de embriaguez grado 3', 'ART-D04', 'MONETARIA', 19331200.00, NULL, 'activo', FALSE, TRUE, '2026-03-25 15:12:00', '2026-03-25 15:12:00', NULL),
('37e7d056-cb1e-4e9e-8eb1-74c0645616ca', 'B01', 'No acatar orden de autoridad', 'ART-B01', 'MONETARIA', 1208200.00, NULL, 'activo', TRUE, TRUE, '2026-03-25 15:12:00', '2026-03-25 15:12:00', NULL),
('6b68be9d-c20f-48ac-90a9-3735a91a09ee', 'B02', 'Adelantar en zona prohibida', 'ART-B02', 'MIXTA', 1208200.00, 180, 'activo', TRUE, TRUE, '2026-03-25 15:12:00', '2026-03-25 15:12:00', NULL),
('221f09bf-f037-4e53-91f7-34c61c2c8b38', 'B03', 'Usar teléfono celular al conducir', 'ART-B03', 'MIXTA', 604100.00, NULL, 'activo', TRUE, TRUE, '2026-03-25 15:12:00', '2026-03-25 15:12:00', NULL),
('c138c0d4-2ade-416f-83e6-ee49bd8280fc', 'B04', 'Circular sin placas visibles', 'ART-B04', 'MONETARIA', 1208200.00, NULL, 'activo', TRUE, TRUE, '2026-03-25 15:12:00', '2026-03-25 15:12:00', NULL),
('3f1b62c2-e39c-4bfc-9db0-a42fa593d463', 'A01', 'Peatón cruza por sitio no permitido', 'ART-A01', 'MONETARIA', 151000.00, NULL, 'activo', TRUE, TRUE, '2026-03-25 15:12:00', '2026-03-25 15:12:00', NULL),
('ca8229ff-9790-4e83-b183-0ac626369908', 'A02', 'Invadir carril exclusivo', 'ART-A02', 'MONETARIA', 604100.00, NULL, 'activo', TRUE, TRUE, '2026-03-25 15:12:00', '2026-03-25 15:12:00', NULL);
