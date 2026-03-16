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
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  revocado BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_refresh_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_usuario_id
ON refresh_tokens(usuario_id);

INSERT INTO usuarios (username, email, password_hash, rol, estado)
VALUES
  (
    'admin',
    'admin@simcomp.co',
    '$2b$10$IGLh87FUGvUAAVvH36LFL.gt4OzSlbGoXfPhjmBQQ95UoARmAY9pO',
    'admin',
    'activo'
  ),
  (
    'agente',
    'agente@simcomp.co',
    '$2b$10$00Y/Kv.LpCGkc3NEEELMOOqW/xULMtJ0htBMsackzzRAM2zUHxl7i',
    'agente',
    'activo'
  ),
  (
    'supervisor',
    'supervisor@simcomp.co',
    '$2b$10$4trl5aVbsy8shBBEsryBkOwJ3ktthgLzW7ZVKBBiFQ59n0hFWtuh6',
    'supervisor',
    'activo'
  ),
  (
    'ciudadano',
    'ciudadano@simcomp.co',
    '$2b$10$GIqo50DgNO1YH5HCCFxXtevSljhpkltfkWDvmAv4chRVNdZpBaYOa',
    'ciudadano',
    'activo'
  )
ON CONFLICT (username) DO NOTHING;