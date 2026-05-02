#!/bin/bash
# Script para generar los archivos de secretos requeridos por Docker Swarm
# SIMCOMP - Auditoría de Producción

echo "========================================================="
# shellcheck disable=SC2028
echo "  SIMCOMP - Generador de Secretos (Docker Swarm)"
echo "========================================================="

# Moverse a la raíz del proyecto
cd "$(dirname "$0")/.." || exit 1

SECRETS_DIR="provisioning_docker/secrets"
mkdir -p "$SECRETS_DIR"

echo "[+] Directorio de secretos: $SECRETS_DIR"

# Función para obtener un valor de un .env.swarm si existe, o usar un default
get_val() {
  local file=$1
  local key=$2
  local default=$3
  if [ -f "$file" ]; then
    local val=$(grep "^$key=" "$file" | cut -d'=' -f2-)
    if [ -n "$val" ]; then
      echo "$val"
      return
    fi
  fi
  echo "$default"
}

SWARM_ENV=".env.swarm"

# Definir los secretos
echo "[+] Generando archivos de secretos..."

# DB Passwords
get_val "$SWARM_ENV" "AUTH_DB_PASSWORD" "auth_pass" > "$SECRETS_DIR/auth_db_pass.txt"
get_val "$SWARM_ENV" "PERSONAS_DB_PASSWORD" "personas_pass" > "$SECRETS_DIR/personas_db_pass.txt"
get_val "$SWARM_ENV" "AUTOMOTORES_DB_PASSWORD" "automotores_pass" > "$SECRETS_DIR/automotores_db_pass.txt"
get_val "$SWARM_ENV" "INFRACCIONES_DB_PASSWORD" "infracciones_pass" > "$SECRETS_DIR/infracciones_db_pass.txt"
get_val "$SWARM_ENV" "COMPARENDOS_DB_PASSWORD" "comparendos_pass" > "$SECRETS_DIR/comparendos_db_pass.txt"

# JWT Secret
get_val "$SWARM_ENV" "JWT_SECRET" "supersecretkey_auth_2026" > "$SECRETS_DIR/jwt_secret.txt"

echo "    -> Creado: auth_db_pass.txt"
echo "    -> Creado: personas_db_pass.txt"
echo "    -> Creado: automotores_db_pass.txt"
echo "    -> Creado: infracciones_db_pass.txt"
echo "    -> Creado: comparendos_db_pass.txt"
echo "    -> Creado: jwt_secret.txt"

echo ""
echo "¡Secretos generados con éxito!"
echo "Ahora puedes ejecutar: vagrant provision managerDocker --provision-with deploy-stack"
echo "========================================================="
