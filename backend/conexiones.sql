-- ==========================================
-- CONEXIONES PARA DBEAVER / PGFADMIN (POSTGRESQL)
-- ==========================================

-- 1. Microservicio Auth (ms-auth-service)
-- Motor: PostgreSQL
-- Host: localhost
-- Puerto: 5432
-- Base de Datos: auth_db
-- Usuario: auth_user
-- Contraseña: auth_pass
-- URL JDBC: jdbc:postgresql://localhost:5432/auth_db

-- 2. Microservicio Personas (ms-personas)
-- Motor: PostgreSQL
-- Host: localhost
-- Puerto: 5433
-- Base de Datos: personas_db
-- Usuario: personas_user
-- Contraseña: personas_pass
-- URL JDBC: jdbc:postgresql://localhost:5433/personas_db

-- 3. Microservicio Automotores (ms-automotores)
-- Motor: PostgreSQL
-- Host: localhost
-- Puerto: 5434
-- Base de Datos: automotores_db
-- Usuario: automotores_user
-- Contraseña: automotores_pass
-- URL JDBC: jdbc:postgresql://localhost:5434/automotores_db

-- 4. Microservicio Infracciones (ms-infracciones)
-- Motor: PostgreSQL
-- Host: localhost
-- Puerto: 5435
-- Base de Datos: infracciones_db
-- Usuario: infracciones_user
-- Contraseña: infracciones_pass
-- URL JDBC: jdbc:postgresql://localhost:5435/infracciones_db

-- 5. Microservicio Comparendos (ms-comparendos)
-- Motor: PostgreSQL
-- Host: localhost
-- Puerto: 5436
-- Base de Datos: comparendos_db
-- Usuario: comparendos_user
-- Contraseña: comparendos_pass
-- URL JDBC: jdbc:postgresql://localhost:5436/comparendos_db

-- ==========================================
-- Consultas de prueba rápidas
-- ==========================================
-- SELECT * FROM usuarios; -- (En auth_db)
-- SELECT * FROM personas; -- (En personas_db)
-- SELECT * FROM vehiculos; -- (En automotores_db)
-- SELECT * FROM infracciones; -- (En infracciones_db)
-- SELECT * FROM comparendos; -- (En comparendos_db)
