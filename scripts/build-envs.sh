#!/bin/bash
# Script para generar .env, .env.local, .env.swarm, .env.vagrant a partir de .env.example en todos los servicios

echo "========================================================="
echo "  SIMCOMP - Generador de Entornos (.env) a partir de .env.example"
echo "========================================================="
echo "Este script recreará los archivos .env, .env.local, .env.vagrant y .env.swarm"
echo "para todos los microservicios y el frontend."
echo ""

# Moverse a la raíz del proyecto
cd "$(dirname "$0")/.." || exit 1

SERVICES=(
  "."
  "provisioning_docker"
  "backend/ms-auth-service"
  "backend/ms-automotores"
  "backend/ms-comparendos"
  "backend/ms-infracciones"
  "backend/ms-personas"
  "backend/ms-reportes"
  "analytics-spark-service"
  "frontend"
)

for SERVICE in "${SERVICES[@]}"; do
  if [ -f "$SERVICE/.env.example" ]; then
    echo "[+] Procesando: $SERVICE"
    
    awk '
    BEGIN { mode="shared"; shared=""; local_env=""; vagrant_env=""; docker_env=""; swarm_env=""; default_env="" }
    /^#\s*1\./ { mode="local"; next }
    /^#\s*2\./ { mode="vagrant"; next }
    /^#\s*3\./ { mode="docker"; next }
    /^#\s*4\./ { mode="swarm"; next }
    /^#\s*Configuración para desarrollo local/ { mode="skip"; next }
    /^#\s*DEFAULT \/ PRODUCTION/ { mode="default"; next }
    {
      if (mode == "skip") next;
      
      line = $0
      # Descomentar variables (ej: "# VAR=VAL" o "#VAR=VAL")
      if (line ~ /^#\s+[a-zA-Z0-9_]+=/) {
        sub(/^#\s+/, "", line)
      } else if (line ~ /^#[a-zA-Z0-9_]+=/) {
        sub(/^#/, "", line)
      }
      
      if (mode == "shared") shared = shared line "\n"
      else if (mode == "local") local_env = local_env line "\n"
      else if (mode == "vagrant") vagrant_env = vagrant_env line "\n"
      else if (mode == "docker") docker_env = docker_env line "\n"
      else if (mode == "swarm") swarm_env = swarm_env line "\n"
      else if (mode == "default") default_env = default_env line "\n"
    }
    END {
      # Escribir los archivos combinando la parte compartida con el bloque específico
      printf "%s", shared local_env > "'"$SERVICE"'/.env.local"
      printf "%s", shared vagrant_env > "'"$SERVICE"'/.env.vagrant"
      
      # .env principal usa la configuración de Docker Local
      printf "%s", shared docker_env > "'"$SERVICE"'/.env"
      
      # .env.swarm usa la configuración de Swarm
      printf "%s", shared swarm_env > "'"$SERVICE"'/.env.swarm"
      
      # Si hay variables por defecto, las anexamos al final de .env.swarm (como fallback de prod)
      if (default_env != "") {
         printf "%s", default_env >> "'"$SERVICE"'/.env.swarm"
      }
    }
    ' "$SERVICE/.env.example"
    
    echo "    -> Creados: .env, .env.local, .env.vagrant, .env.swarm"
  else
    echo "[-] Saltando $SERVICE (No se encontró .env.example)"
  fi
done

echo ""
echo "¡Generación completada! Todos los entornos están listos para usarse."
echo "========================================================="
