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

TRUNCATE TABLE historial_comparendos RESTART IDENTITY CASCADE;
TRUNCATE TABLE comparendos RESTART IDENTITY CASCADE;

INSERT INTO comparendos (
  id, numero_comparendo, ciudadano_documento, ciudadano_nombre, agente_documento, agente_nombre,
  placa_vehiculo, infraccion_codigo, infraccion_descripcion, valor_multa, fecha_comparendo,
  lugar, ciudad, observaciones, estado, created_at, updated_at, deleted_at
) VALUES
('3e7f2d93-9c20-4a4d-b2e5-4ff0f1d73001', 'CMP-2026-000001', '1010001001', 'Juan Perez', '1098700001', 'Carlos Gomez', 'KSP214', 'C03', 'Estacionar en sitio prohibido.', 520000.00, '2026-01-10 08:15:00', 'Av. 3N con Calle 44', 'Cali', 'Vehículo estacionado en zona de restricción.', 'PENDIENTE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),

('3e7f2d93-9c20-4a4d-b2e5-4ff0f1d73002', 'CMP-2026-000002', '1010001002', 'Maria Garcia', '1098700002', 'Andrea Lopez', 'HJL482', 'C04', 'No utilizar el cinturón de seguridad.', 570000.00, '2026-01-12 10:30:00', 'Autopista Suroriental', 'Cali', 'Conductora sin cinturón al momento del control.', 'PAGADO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),

('3e7f2d93-9c20-4a4d-b2e5-4ff0f1d73003', 'CMP-2026-000003', '1010001003', 'Andres Rodriguez', '1098700003', 'Jhon Mosquera', 'QWE91F', 'C07', 'Conducir usando dispositivos móviles.', 650000.00, '2026-01-14 18:05:00', 'Cra 100 con Calle 16', 'Cali', 'Se observó uso de celular mientras conducía.', 'PENDIENTE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),

('3e7f2d93-9c20-4a4d-b2e5-4ff0f1d73004', 'CMP-2026-000004', '1010001004', 'Sofia Hernandez', '1098700004', 'Paola Ruiz', 'TRK550', 'C08', 'No respetar la luz roja del semáforo.', 1300000.00, '2026-01-16 07:50:00', 'Calle 5 con Carrera 39', 'Cali', 'Paso con semáforo en rojo.', 'ANULADO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),

('3e7f2d93-9c20-4a4d-b2e5-4ff0f1d73005', 'CMP-2026-000005', '1010001005', 'Camilo Castillo', '1098700005', 'Felipe Torres', 'MLN773', 'C05', 'Conducir sin revisión técnico-mecánica vigente.', 780000.00, '2026-01-19 15:20:00', 'Cra 8 con Calle 70', 'Cali', 'RTM vencida al verificar documentos.', 'PENDIENTE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),

('3e7f2d93-9c20-4a4d-b2e5-4ff0f1d73006', 'CMP-2026-000006', '1010001006', 'Valentina Moreno', '1098700001', 'Carlos Gomez', 'ZXC38D', 'C02', 'No portar la licencia de conducción.', 420000.00, '2026-01-21 09:40:00', 'Terminal de Transporte', 'Cali', 'No presentó licencia física ni digital.', 'PAGADO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),

('3e7f2d93-9c20-4a4d-b2e5-4ff0f1d73007', 'CMP-2026-000007', '1010001007', 'Sebastian Vargas', '1098700002', 'Andrea Lopez', 'BGT901', 'C09', 'Exceder los límites de velocidad permitidos.', 900000.00, '2026-01-24 11:55:00', 'Recta Cali - Palmira', 'Cali', 'Captado por control operativo a velocidad superior a la permitida.', 'PENDIENTE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),

('3e7f2d93-9c20-4a4d-b2e5-4ff0f1d73008', 'CMP-2026-000008', '1010001008', 'Daniela Ortega', '1098700003', 'Jhon Mosquera', 'PLM662', 'C06', 'Transitar sin SOAT vigente.', 1160000.00, '2026-01-27 13:10:00', 'Av. Ciudad de Cali', 'Cali', 'SOAT no vigente al momento del control.', 'ANULADO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);

INSERT INTO historial_comparendos (
  id, comparendo_id, estado_anterior, estado_nuevo, observacion, fecha_evento,
  created_at, updated_at, deleted_at
) VALUES
('e761c37e-0b3d-40e8-9d5c-9e4d8a911001', '3e7f2d93-9c20-4a4d-b2e5-4ff0f1d73001', NULL, 'PENDIENTE', 'Comparendo creado.', '2026-01-10 08:15:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),

('e761c37e-0b3d-40e8-9d5c-9e4d8a911002', '3e7f2d93-9c20-4a4d-b2e5-4ff0f1d73002', NULL, 'PENDIENTE', 'Comparendo creado.', '2026-01-12 10:30:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('e761c37e-0b3d-40e8-9d5c-9e4d8a911003', '3e7f2d93-9c20-4a4d-b2e5-4ff0f1d73002', 'PENDIENTE', 'PAGADO', 'Pago registrado en ventanilla.', '2026-01-15 09:10:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),

('e761c37e-0b3d-40e8-9d5c-9e4d8a911004', '3e7f2d93-9c20-4a4d-b2e5-4ff0f1d73003', NULL, 'PENDIENTE', 'Comparendo creado.', '2026-01-14 18:05:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),

('e761c37e-0b3d-40e8-9d5c-9e4d8a911005', '3e7f2d93-9c20-4a4d-b2e5-4ff0f1d73004', NULL, 'PENDIENTE', 'Comparendo creado.', '2026-01-16 07:50:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('e761c37e-0b3d-40e8-9d5c-9e4d8a911006', '3e7f2d93-9c20-4a4d-b2e5-4ff0f1d73004', 'PENDIENTE', 'ANULADO', 'Anulado por error en identificación del vehículo.', '2026-01-17 12:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),

('e761c37e-0b3d-40e8-9d5c-9e4d8a911007', '3e7f2d93-9c20-4a4d-b2e5-4ff0f1d73005', NULL, 'PENDIENTE', 'Comparendo creado.', '2026-01-19 15:20:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),

('e761c37e-0b3d-40e8-9d5c-9e4d8a911008', '3e7f2d93-9c20-4a4d-b2e5-4ff0f1d73006', NULL, 'PENDIENTE', 'Comparendo creado.', '2026-01-21 09:40:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('e761c37e-0b3d-40e8-9d5c-9e4d8a911009', '3e7f2d93-9c20-4a4d-b2e5-4ff0f1d73006', 'PENDIENTE', 'PAGADO', 'Pago realizado por PSE.', '2026-01-23 14:25:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),

('e761c37e-0b3d-40e8-9d5c-9e4d8a911010', '3e7f2d93-9c20-4a4d-b2e5-4ff0f1d73007', NULL, 'PENDIENTE', 'Comparendo creado.', '2026-01-24 11:55:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),

('e761c37e-0b3d-40e8-9d5c-9e4d8a911011', '3e7f2d93-9c20-4a4d-b2e5-4ff0f1d73008', NULL, 'PENDIENTE', 'Comparendo creado.', '2026-01-27 13:10:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('e761c37e-0b3d-40e8-9d5c-9e4d8a911012', '3e7f2d93-9c20-4a4d-b2e5-4ff0f1d73008', 'PENDIENTE', 'ANULADO', 'Se validó póliza vigente cargada posteriormente.', '2026-01-28 16:35:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);