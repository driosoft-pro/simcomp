CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_documento_enum') THEN
    CREATE TYPE tipo_documento_enum AS ENUM ('CC', 'CE', 'TI', 'PASAPORTE');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'genero_enum') THEN
    CREATE TYPE genero_enum AS ENUM ('M', 'F', 'O');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_persona_enum') THEN
    CREATE TYPE estado_persona_enum AS ENUM ('activo', 'inactivo');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'categoria_licencia_enum') THEN
    CREATE TYPE categoria_licencia_enum AS ENUM ('A1', 'A2', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_licencia_enum') THEN
    CREATE TYPE estado_licencia_enum AS ENUM ('vigente', 'suspendida', 'vencida', 'cancelada');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_documento tipo_documento_enum NOT NULL DEFAULT 'CC',
  numero_documento VARCHAR(20) NOT NULL UNIQUE,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  genero genero_enum NOT NULL,
  direccion VARCHAR(200) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  estado estado_persona_enum NOT NULL DEFAULT 'activo',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS licencias_conduccion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  numero_licencia VARCHAR(30) NOT NULL UNIQUE,
  categoria categoria_licencia_enum NOT NULL,
  fecha_expedicion DATE NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  estado estado_licencia_enum NOT NULL,
  observaciones TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

TRUNCATE TABLE licencias_conduccion RESTART IDENTITY CASCADE;
TRUNCATE TABLE personas RESTART IDENTITY CASCADE;

INSERT INTO personas (id, tipo_documento, numero_documento, nombres, apellidos, fecha_nacimiento, genero, direccion, telefono, email, estado, created_at, updated_at, deleted_at) VALUES
-- ADMIN
('a4316f91-1c71-44df-8b67-0d0a44bba001', 'CC', '1000100010', 'Alejandro', 'Rojas', '1985-03-12', 'M', 'Cra 45 #12-34, Cali', '3001000010', 'admin@simcomp.local', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),

-- SUPERVISORES
('a4316f91-1c71-44df-8b67-0d0a44bba002', 'CC', '1000100011', 'Laura', 'Martinez', '1988-06-21', 'F', 'Cra 18 #44-12, Cali', '3001000011', 'laura.martinez@simcomp.local', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('a4316f91-1c71-44df-8b67-0d0a44bba003', 'CC', '1000100012', 'Diego', 'Ramirez', '1986-11-08', 'M', 'Cl 9 #56-20, Cali', '3001000012', 'diego.ramirez@simcomp.local', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),

-- AGENTES
('a4316f91-1c71-44df-8b67-0d0a44bba004', 'CC', '1098700001', 'Carlos', 'Gomez', '1990-01-14', 'M', 'Cl 25 #17-88, Cali', '3108700001', 'carlos.gomez@transito.gov.co', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('a4316f91-1c71-44df-8b67-0d0a44bba005', 'CC', '1098700002', 'Andrea', 'Lopez', '1992-09-30', 'F', 'Cra 70 #5-19, Cali', '3108700002', 'andrea.lopez@transito.gov.co', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('a4316f91-1c71-44df-8b67-0d0a44bba006', 'CC', '1098700003', 'Jhon', 'Mosquera', '1989-07-22', 'M', 'Cl 13 #23-41, Cali', '3108700003', 'jhon.mosquera@transito.gov.co', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('a4316f91-1c71-44df-8b67-0d0a44bba007', 'CC', '1098700004', 'Paola', 'Ruiz', '1991-02-17', 'F', 'Cra 39 #10-55, Cali', '3108700004', 'paola.ruiz@transito.gov.co', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('a4316f91-1c71-44df-8b67-0d0a44bba008', 'CC', '1098700005', 'Felipe', 'Torres', '1993-12-03', 'M', 'Cl 52 #8-77, Cali', '3108700005', 'felipe.torres@transito.gov.co', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),

-- CIUDADANOS CON USUARIO
('a4316f91-1c71-44df-8b67-0d0a44bba009', 'CC', '1010001001', 'Juan', 'Perez', '1998-04-10', 'M', 'Cra 66 #14-22, Cali', '3201001001', 'juan.perez@gmail.com', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('a4316f91-1c71-44df-8b67-0d0a44bba010', 'CC', '1010001002', 'Maria', 'Garcia', '1997-05-16', 'F', 'Cl 48 #22-18, Cali', '3201001002', 'maria.garcia@gmail.com', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('a4316f91-1c71-44df-8b67-0d0a44bba011', 'CC', '1010001003', 'Andres', 'Rodriguez', '1995-08-25', 'M', 'Cra 80 #16-40, Cali', '3201001003', 'andres.rodriguez@gmail.com', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('a4316f91-1c71-44df-8b67-0d0a44bba012', 'CC', '1010001004', 'Sofia', 'Hernandez', '2000-01-11', 'F', 'Cl 31 #19-15, Cali', '3201001004', 'sofia.hernandez@gmail.com', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('a4316f91-1c71-44df-8b67-0d0a44bba013', 'CC', '1010001005', 'Camilo', 'Castillo', '1996-10-19', 'M', 'Cra 15 #60-09, Cali', '3201001005', 'camilo.castillo@gmail.com', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('a4316f91-1c71-44df-8b67-0d0a44bba014', 'CC', '1010001006', 'Valentina', 'Moreno', '1999-12-27', 'F', 'Cl 72 #4-11, Cali', '3201001006', 'valentina.moreno@gmail.com', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),

-- CIUDADANOS SIN USUARIO
('a4316f91-1c71-44df-8b67-0d0a44bba015', 'CC', '1010001007', 'Sebastian', 'Vargas', '1994-07-03', 'M', 'Cra 21 #33-61, Cali', '3201001007', 'sebastian.vargas@gmail.com', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('a4316f91-1c71-44df-8b67-0d0a44bba016', 'CC', '1010001008', 'Daniela', 'Ortega', '1998-09-14', 'F', 'Cl 65 #17-29, Cali', '3201001008', 'daniela.ortega@gmail.com', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('a4316f91-1c71-44df-8b67-0d0a44bba017', 'CC', '1010001009', 'Nicolas', 'Mendez', '1993-03-28', 'M', 'Cra 28 #41-09, Cali', '3201001009', 'nicolas.mendez@gmail.com', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('a4316f91-1c71-44df-8b67-0d0a44bba018', 'CC', '1010001010', 'Paula', 'Navarro', '1997-06-05', 'F', 'Cl 11 #75-33, Cali', '3201001010', 'paula.navarro@gmail.com', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('a4316f91-1c71-44df-8b67-0d0a44bba019', 'CC', '1010001011', 'David', 'Salazar', '1992-02-09', 'M', 'Cra 94 #8-27, Cali', '3201001011', 'david.salazar@gmail.com', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('a4316f91-1c71-44df-8b67-0d0a44bba020', 'CC', '1010001012', 'Juliana', 'Pineda', '2001-11-20', 'F', 'Cl 54 #26-18, Cali', '3201001012', 'juliana.pineda@gmail.com', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);

INSERT INTO licencias_conduccion (id, persona_id, numero_licencia, categoria, fecha_expedicion, fecha_vencimiento, estado, observaciones, created_at, updated_at, deleted_at) VALUES
('f8f13ed1-e3ba-40d7-8f0e-0e2fdd1f1001', 'a4316f91-1c71-44df-8b67-0d0a44bba009', 'LIC-1010001001', 'B1', '2022-01-10', '2032-01-10', 'vigente', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('f8f13ed1-e3ba-40d7-8f0e-0e2fdd1f1002', 'a4316f91-1c71-44df-8b67-0d0a44bba010', 'LIC-1010001002', 'B1', '2021-07-15', '2031-07-15', 'vigente', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('f8f13ed1-e3ba-40d7-8f0e-0e2fdd1f1003', 'a4316f91-1c71-44df-8b67-0d0a44bba011', 'LIC-1010001003', 'B2', '2020-04-18', '2030-04-18', 'vigente', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('f8f13ed1-e3ba-40d7-8f0e-0e2fdd1f1004', 'a4316f91-1c71-44df-8b67-0d0a44bba012', 'LIC-1010001004', 'B1', '2023-03-02', '2033-03-02', 'vigente', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('f8f13ed1-e3ba-40d7-8f0e-0e2fdd1f1005', 'a4316f91-1c71-44df-8b67-0d0a44bba013', 'LIC-1010001005', 'C1', '2019-09-09', '2029-09-09', 'vigente', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('f8f13ed1-e3ba-40d7-8f0e-0e2fdd1f1006', 'a4316f91-1c71-44df-8b67-0d0a44bba014', 'LIC-1010001006', 'B1', '2021-11-30', '2031-11-30', 'vigente', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('f8f13ed1-e3ba-40d7-8f0e-0e2fdd1f1007', 'a4316f91-1c71-44df-8b67-0d0a44bba015', 'LIC-1010001007', 'B1', '2020-06-22', '2030-06-22', 'vigente', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('f8f13ed1-e3ba-40d7-8f0e-0e2fdd1f1008', 'a4316f91-1c71-44df-8b67-0d0a44bba016', 'LIC-1010001008', 'B2', '2022-02-14', '2032-02-14', 'vigente', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('f8f13ed1-e3ba-40d7-8f0e-0e2fdd1f1009', 'a4316f91-1c71-44df-8b67-0d0a44bba017', 'LIC-1010001009', 'B1', '2018-08-07', '2028-08-07', 'vigente', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('f8f13ed1-e3ba-40d7-8f0e-0e2fdd1f1010', 'a4316f91-1c71-44df-8b67-0d0a44bba018', 'LIC-1010001010', 'B1', '2023-05-19', '2033-05-19', 'vigente', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('f8f13ed1-e3ba-40d7-8f0e-0e2fdd1f1011', 'a4316f91-1c71-44df-8b67-0d0a44bba019', 'LIC-1010001011', 'C1', '2019-01-25', '2029-01-25', 'vigente', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('f8f13ed1-e3ba-40d7-8f0e-0e2fdd1f1012', 'a4316f91-1c71-44df-8b67-0d0a44bba020', 'LIC-1010001012', 'B1', '2024-02-10', '2034-02-10', 'vigente', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);