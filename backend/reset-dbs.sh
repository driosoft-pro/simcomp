#!/usr/bin/env bash
set -Eeuo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${BASE_DIR}"

DB_CONTAINERS=(
  "db-ms-auth-service"
  "db-ms-comparendos"
  "db-ms-automotores"
  "db-ms-infracciones"
  "db-ms-personas"
)

DB_VOLUMES=(
  "ms-auth-service_auth_db_data"
  "ms-comparendos_comparendos_db_data"
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

# ─── Container engine detection ───────────────────────────────────────────────

CONTAINER_ENGINE=""

detect_engine() {
  if [[ -n "${CONTAINER_ENGINE:-}" ]]; then
    # Allow caller to force the engine via env variable
    command -v "$CONTAINER_ENGINE" >/dev/null 2>&1 || {
      err "El motor especificado '${CONTAINER_ENGINE}' no está disponible."
      exit 1
    }
    return
  fi

  if command -v podman >/dev/null 2>&1; then
    CONTAINER_ENGINE="podman"
  elif command -v docker >/dev/null 2>&1; then
    CONTAINER_ENGINE="docker"
  else
    err "No se encontró podman ni docker instalado."
    exit 1
  fi

  ok "Motor de contenedores detectado: ${CONTAINER_ENGINE}"
}

# Returns "podman compose" or "docker compose" (or "docker-compose" as fallback)
compose_cmd() {
  if [[ "$CONTAINER_ENGINE" == "podman" ]]; then
    echo "podman compose"
  else
    # Prefer the built-in plugin; fall back to standalone docker-compose
    if docker compose version >/dev/null 2>&1; then
      echo "docker compose"
    else
      echo "docker-compose"
    fi
  fi
}

# ─── Logging helpers ──────────────────────────────────────────────────────────

log() { printf "\n\033[1;34m[INFO]\033[0m %s\n" "$1"; }
ok()  { printf "\033[1;32m[OK]\033[0m %s\n"   "$1"; }
warn(){ printf "\033[1;33m[WARN]\033[0m %s\n" "$1"; }
err() { printf "\033[1;31m[ERROR]\033[0m %s\n" "$1"; }

# ─── Helpers ──────────────────────────────────────────────────────────────────

container_exists() {
  "$CONTAINER_ENGINE" container inspect "$1" >/dev/null 2>&1
}

volume_exists() {
  "$CONTAINER_ENGINE" volume inspect "$1" >/dev/null 2>&1
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

# ─── Core operations ──────────────────────────────────────────────────────────

stop_and_remove_db_containers() {
  log "Deteniendo contenedores de bases de datos..."
  for c in "${DB_CONTAINERS[@]}"; do
    if container_exists "$c"; then
      "$CONTAINER_ENGINE" stop "$c" || true
      ok "Contenedor detenido: $c"
    else
      warn "No existe el contenedor: $c"
    fi
  done

  log "Eliminando contenedores de bases de datos..."
  for c in "${DB_CONTAINERS[@]}"; do
    if container_exists "$c"; then
      "$CONTAINER_ENGINE" rm -f "$c" || true
      ok "Contenedor eliminado: $c"
    else
      warn "Ya no existe el contenedor: $c"
    fi
  done
}

remove_db_volumes() {
  log "Eliminando volúmenes de PostgreSQL..."
  for v in "${DB_VOLUMES[@]}"; do
    if volume_exists "$v"; then
      "$CONTAINER_ENGINE" volume rm -f "$v" || true
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
  local compose

  if [[ ! -d "$service_dir" ]]; then
    warn "No existe el directorio ${service_dir}, se omite."
    return
  fi

  if ! compose_file="$(find_compose_file "$service_dir")"; then
    warn "No se encontró compose en ${service_dir}, se omite."
    return
  fi

  compose="$(compose_cmd)"

  log "Recreando ${service} desde ${service_dir} con [${compose}]..."
  (
    cd "$service_dir"
    $compose -f "$compose_file" up -d --build --force-recreate
  )
  ok "${service} levantado."
}

status_all() {
  log "Contenedores activos:"
  "$CONTAINER_ENGINE" ps || true

  log "Volúmenes actuales:"
  "$CONTAINER_ENGINE" volume ls || true
}

reset_all() {
  stop_and_remove_db_containers
  remove_db_volumes

  for service in "${MICROSERVICES[@]}"; do
    rebuild_microservice "$service"
  done

  status_all
}

# ─── Entry point ──────────────────────────────────────────────────────────────

detect_engine

case "${1:-reset}" in
  reset)
    reset_all
    ;;
  status)
    status_all
    ;;
  *)
    echo "Uso: $0 [reset|status]"
    echo "  Env: CONTAINER_ENGINE=podman|docker  (fuerza un motor específico)"
    exit 1
    ;;
esac