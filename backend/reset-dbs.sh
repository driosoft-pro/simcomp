#!/usr/bin/env bash
set -Eeuo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${BASE_DIR}/backend"

DB_CONTAINERS=(
  "db-ms-auth-service"
  "db-ms-comparendos"
  "db-ms-automotores"
  "db-ms-infracciones"
  "db-ms-personas"
)

DB_VOLUMES=(
  "ms-auth-service_auth_db_data"
  "ms-comparendos_comparendos_data"
  "ms-automotores_automotores_db_data"
  "ms-infracciones_infracciones_db_data"
  "ms-personas_personas_db_data"
)

MICROSERVICES=(
  "ms-auth-service"
  "ms-personas"
  "ms-automotores"
  "ms-infracciones"
  "ms-comparendos"
)

log() {
  printf "\n\033[1;34m[INFO]\033[0m %s\n" "$1"
}

ok() {
  printf "\033[1;32m[OK]\033[0m %s\n" "$1"
}

warn() {
  printf "\033[1;33m[WARN]\033[0m %s\n" "$1"
}

err() {
  printf "\033[1;31m[ERROR]\033[0m %s\n" "$1"
}

check_podman() {
  command -v podman >/dev/null 2>&1 || {
    err "podman no está instalado."
    exit 1
  }
}

find_compose_file() {
  local service_dir="$1"

  for f in docker-compose.yml docker-compose.yaml compose.yml compose.yaml; do
    if [[ -f "${service_dir}/${f}" ]]; then
      echo "$f"
      return 0
    fi
  done

  return 1
}

stop_and_remove_db_containers() {
  log "Deteniendo contenedores de bases de datos..."
  for c in "${DB_CONTAINERS[@]}"; do
    if podman container exists "$c" 2>/dev/null; then
      podman stop "$c" || true
      ok "Contenedor detenido: $c"
    else
      warn "No existe el contenedor: $c"
    fi
  done

  log "Eliminando contenedores de bases de datos..."
  for c in "${DB_CONTAINERS[@]}"; do
    if podman container exists "$c" 2>/dev/null; then
      podman rm -f "$c" || true
      ok "Contenedor eliminado: $c"
    else
      warn "Ya no existe el contenedor: $c"
    fi
  done
}

remove_db_volumes() {
  log "Eliminando volúmenes de PostgreSQL..."
  for v in "${DB_VOLUMES[@]}"; do
    if podman volume exists "$v" 2>/dev/null; then
      podman volume rm -f "$v" || true
      ok "Volumen eliminado: $v"
    else
      warn "No existe el volumen: $v"
    fi
  done
}

rebuild_microservice() {
  local service="$1"
  local service_dir="${BACKEND_DIR}/${service}"
  local compose_file

  if [[ ! -d "$service_dir" ]]; then
    warn "No existe el directorio ${service_dir}, se omite."
    return
  fi

  if ! compose_file="$(find_compose_file "$service_dir")"; then
    warn "No se encontró compose en ${service_dir}, se omite."
    return
  fi

  log "Recreando ${service} desde ${service_dir}..."
  (
    cd "$service_dir"
    podman compose -f "$compose_file" up -d --build --force-recreate
  )
  ok "${service} levantado."
}

status_all() {
  log "Contenedores activos:"
  podman ps || true

  log "Volúmenes actuales:"
  podman volume ls || true
}

reset_all() {
  stop_and_remove_db_containers
  remove_db_volumes

  for service in "${MICROSERVICES[@]}"; do
    rebuild_microservice "$service"
  done

  status_all
}

case "${1:-reset}" in
  reset)
    check_podman
    reset_all
    ;;
  status)
    check_podman
    status_all
    ;;
  *)
    echo "Uso: $0 [reset|status]"
    exit 1
    ;;
esac