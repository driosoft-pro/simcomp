CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'clase_vehiculo_enum') THEN
    CREATE TYPE clase_vehiculo_enum AS ENUM ('AUTOMOVIL', 'MOTOCICLETA', 'CAMIONETA', 'CAMPERO', 'BUS', 'CAMION');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'servicio_vehiculo_enum') THEN
    CREATE TYPE servicio_vehiculo_enum AS ENUM ('PARTICULAR', 'PUBLICO', 'OFICIAL');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_vehiculo_enum') THEN
    CREATE TYPE estado_vehiculo_enum AS ENUM ('activo', 'inactivo', 'inmovilizado');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'condicion_vehiculo_enum') THEN
    CREATE TYPE condicion_vehiculo_enum AS ENUM ('LEGAL', 'REPORTADO_ROBO', 'RECUPERADO', 'EMBARGADO');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS vehiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placa VARCHAR(10) NOT NULL UNIQUE,
  vin VARCHAR(30) NOT NULL UNIQUE,
  numero_motor VARCHAR(30) NOT NULL UNIQUE,
  numero_chasis VARCHAR(30) NOT NULL UNIQUE,
  marca VARCHAR(50) NOT NULL,
  linea VARCHAR(50) NOT NULL,
  modelo INTEGER NOT NULL,
  color VARCHAR(30) NOT NULL,
  clase clase_vehiculo_enum NOT NULL,
  servicio servicio_vehiculo_enum NOT NULL DEFAULT 'PARTICULAR',
  propietario_documento VARCHAR(20) NOT NULL,
  propietario_nombre VARCHAR(200) NOT NULL,
  condicion condicion_vehiculo_enum NOT NULL DEFAULT 'LEGAL',
  estado estado_vehiculo_enum NOT NULL DEFAULT 'activo',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

TRUNCATE TABLE vehiculos RESTART IDENTITY CASCADE;

INSERT INTO vehiculos (
  id, placa, vin, numero_motor, numero_chasis, marca, linea, modelo, color,
  clase, servicio, propietario_documento, propietario_nombre, condicion, estado,
  created_at, updated_at, deleted_at
) VALUES
('5c1cfdd9-01ed-4c4d-89d2-b0cb7771a001', 'KSP214', '9BWZZZ377VT004321', 'MTR2142020', 'CHS2142020', 'Chevrolet', 'Onix', 2020, 'Gris Plata', 'AUTOMOVIL', 'PARTICULAR', '1010001001', 'Juan Perez', 'LEGAL', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('5c1cfdd9-01ed-4c4d-89d2-b0cb7771a002', 'HJL482', '3N1CN7AP4KL812345', 'MTR4822019', 'CHS4822019', 'Nissan', 'Versa', 2019, 'Blanco', 'AUTOMOVIL', 'PARTICULAR', '1010001002', 'Maria Garcia', 'LEGAL', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('5c1cfdd9-01ed-4c4d-89d2-b0cb7771a003', 'QWE91F', '8CHFD6D33KU123456', 'MTR91F2021', 'CHS91F2021', 'Yamaha', 'FZ 2.0', 2021, 'Negro', 'MOTOCICLETA', 'PARTICULAR', '1010001003', 'Andres Rodriguez', 'LEGAL', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('5c1cfdd9-01ed-4c4d-89d2-b0cb7771a004', 'TRK550', '1HGCM82633A654321', 'MTR5502018', 'CHS5502018', 'Renault', 'Duster', 2018, 'Rojo', 'CAMPERO', 'PARTICULAR', '1010001004', 'Sofia Hernandez', 'LEGAL', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('5c1cfdd9-01ed-4c4d-89d2-b0cb7771a005', 'MLN773', '9BGKS48T0FG198765', 'MTR7732022', 'CHS7732022', 'Mazda', 'CX-30', 2022, 'Azul', 'CAMIONETA', 'PARTICULAR', '1010001005', 'Camilo Castillo', 'LEGAL', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('5c1cfdd9-01ed-4c4d-89d2-b0cb7771a006', 'ZXC38D', 'ME4JC5210LT987654', 'MTR38D2023', 'CHS38D2023', 'Honda', 'CB 125F', 2023, 'Rojo Negro', 'MOTOCICLETA', 'PARTICULAR', '1010001006', 'Valentina Moreno', 'LEGAL', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('5c1cfdd9-01ed-4c4d-89d2-b0cb7771a007', 'BGT901', 'KL1TD52695B741258', 'MTR9012017', 'CHS9012017', 'Kia', 'Picanto', 2017, 'Plateado', 'AUTOMOVIL', 'PARTICULAR', '1010001007', 'Sebastian Vargas', 'LEGAL', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('5c1cfdd9-01ed-4c4d-89d2-b0cb7771a008', 'PLM662', 'MAJBXXMRKBHY45210', 'MTR6622021', 'CHS6622021', 'Ford', 'EcoSport', 2021, 'Blanco Perla', 'CAMIONETA', 'PARTICULAR', '1010001008', 'Daniela Ortega', 'LEGAL', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);