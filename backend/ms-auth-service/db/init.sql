CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rol_usuario') THEN
    CREATE TYPE rol_usuario AS ENUM ('admin', 'agente', 'supervisor', 'ciudadano');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_usuario') THEN
    CREATE TYPE estado_usuario AS ENUM ('activo', 'inactivo');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol rol_usuario NOT NULL,
  estado estado_usuario NOT NULL DEFAULT 'activo',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  revocado BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

TRUNCATE TABLE refresh_tokens RESTART IDENTITY CASCADE;
TRUNCATE TABLE usuarios RESTART IDENTITY CASCADE;

INSERT INTO usuarios (id, username, email, password_hash, rol, estado, created_at, updated_at, deleted_at) VALUES
-- ADMIN
('2c5b4df0-6d4f-4a74-a17f-8df43c7d8a01', 'admin.simcomp', 'admin@simcomp.gov.co', '$2b$10$qbp6Sf4yVNXEeeIzdQPj8ONBTlikgk6Ch24Fc3qsvbMjdvkK/6xKC', 'admin', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),

-- SUPERVISORES
('8ab7c2f3-4b6b-4e72-a7aa-1c28a4a0d102', 'sup.cali.01', 'laura.martinez@simcomp.gov.co', '$2b$10$HaKCBMksVxzh7ll3PG8oOuoRYs3f1JM5RqSgZw.Fh4jSsAMSL1J5C', 'supervisor', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('b90a1ed2-7ee8-43cc-b4f8-82bcf9c17d03', 'sup.cali.02', 'diego.ramirez@simcomp.gov.co', '$2b$10$yvhv6stv1BWiw86I0DVumO2y1nHEFP3tsUlYj//5yD32ynaowtcxC', 'supervisor', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),

-- AGENTES
('f9d0d184-40f3-43f4-9f98-41664092b104', 'agente.9001', 'carlos.gomez@transito.gov.co', '$2b$10$PzJOknApF1q9Noo.moMc9u7ZHFvyoNcx9ht3QvdHDe1.aTuClJkzO', 'agente', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('4dd4d257-8ad3-4a68-8d8f-1dd49fe57d05', 'agente.9002', 'andrea.lopez@transito.gov.co', '$2b$10$Qk3vl6Ymg/NakNx./EoiZewnANavqF1.LQa1oAJcGRQG7os3BIMrK', 'agente', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('3e568ca6-c4cf-4421-a64b-e392336f3106', 'agente.9003', 'jhon.mosquera@transito.gov.co', '$2b$10$s.OfQmoI82/jPcCpqwKhBe8VtfeBdbffq2ZbIgSG1N5o7NvbecsOC', 'agente', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('7d2f02e1-0d89-4c35-b0d3-3abf9f5da607', 'agente.9004', 'paola.ruiz@transito.gov.co', '$2b$10$PMgkvIKt.D9bWbhNP/MyBOv4Cx0InJBaOzT3/gCXQrC7hsSd.Ptpa', 'agente', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('ad503e75-5477-4c79-a64a-b0ff5a8f1608', 'agente.9005', 'felipe.torres@transito.gov.co', '$2b$10$wH6cu8VJ5.s8ubdXt/vREO.EeK1ur7Zfh0.EbZqKEDR5UQguUNLhS', 'agente', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),

-- CIUDADANOS CON USUARIO
('f174ce63-93d0-40b7-9ea0-8e416f52e109', 'cc.1010001001', 'juan.perez@gmail.com', '$2b$10$XWJ66VafbM1tQ9/3/anuEODtjmzWKv69TFRxxlfQjJRgghYM.mScq', 'ciudadano', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('cb0b1c7b-cbf4-4ea0-bc66-a73eb4d73210', 'cc.1010001002', 'maria.garcia@gmail.com', '$2b$10$CZTbVjThW.ioO.7.9HEzUOPWPNFVhwpQ.4v5gb08YRXtsxdstgPxm', 'ciudadano', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('bbcb6973-1af4-4e5d-b2e5-640cb5ef7d11', 'cc.1010001003', 'andres.rodriguez@gmail.com', '$2b$10$scfN.Z4ihhEpmcQm.8xJl.kGi7TiuTJbcb0nOLY5GaBS4p2yf2tXW', 'ciudadano', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('0a673b39-c6d6-43e8-92ce-c5ba63d4f312', 'cc.1010001004', 'sofia.hernandez@gmail.com', '$2b$10$qRhL8LjWSNvNTG1sJCap1eftvSTg50ABVV00RTTiLMMA9cksjqn9W', 'ciudadano', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('7e41c8a8-2ed2-4c83-92c8-c4a3c86c1f13', 'cc.1010001005', 'camilo.castillo@gmail.com', '$2b$10$ML3uiO7rmBgqqDb.O/q.9O2rHiTemqtBUw7XJV2pLixyIEyJVVFMi', 'ciudadano', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('c4d7bd73-f2b7-44dc-96da-9f2c1a4c3f14', 'cc.1010001006', 'valentina.moreno@gmail.com', '$2b$10$8HeGf0TcP7CedQ/f3AOrOe8vrPn.XxepRS15/IrV6OFnqfWAtDIGW', 'ciudadano', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);

INSERT INTO refresh_tokens (id, usuario_id, token, expires_at, revocado, created_at, updated_at, deleted_at) VALUES
('2f8c52e4-2d77-44fd-93f1-4b786bf41101', 'f174ce63-93d0-40b7-9ea0-8e416f52e109', encode(gen_random_bytes(32), 'hex'), CURRENT_TIMESTAMP + INTERVAL '30 days', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('6b5b4d2f-79af-4540-a020-857b2c785102', 'cb0b1c7b-cbf4-4ea0-bc66-a73eb4d73210', encode(gen_random_bytes(32), 'hex'), CURRENT_TIMESTAMP + INTERVAL '30 days', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
('c0dbe7fc-49fe-40e0-89d5-3315704a5103', '8ab7c2f3-4b6b-4e72-a7aa-1c28a4a0d102', encode(gen_random_bytes(32), 'hex'), CURRENT_TIMESTAMP + INTERVAL '30 days', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);