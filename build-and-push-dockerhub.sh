#!/usr/bin/env bash
set -Eeuo pipefail

# =========================================================
# SIMCOMP - Build & Push to Docker Hub
# Compatible con Docker y Podman
# =========================================================

# ---------- Configuración por defecto ----------
DEFAULT_DOCKERHUB_USER="tu_usuario"
DEFAULT_VERSION="v1.0.0"
DEFAULT_REGISTRY="docker.io"
DEFAULT_ENV_FILE=".env.docker-push"
DEFAULT_ACTION="all"

# ---------- Colores ----------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()   { echo -e "${BLUE}[INFO]${NC} $*"; }
ok()    { echo -e "${GREEN}[OK]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }

usage() {
  cat <<EOF
Uso: $0 [acción] [servicio]

Acciones:
  build   Construye las imágenes
  push    Sube las imágenes
  all     Hace login, build y push (por defecto)

Servicio (opcional):
  Nombre del servicio a procesar (ej: simcomp-auth-service).
  Si no se especifica, se procesan todos.

Variables soportadas en ENV_FILE (.env.docker-push):
  DOCKERHUB_USER, DOCKERHUB_PASS, VERSION, REGISTRY, CONTAINER_CLI
EOF
}

# ---------- Manejo de errores ----------
trap 'error "Ocurrió un error en la línea $LINENO."' ERR

# ---------- Detectar herramienta ----------
detect_container_cli() {
  if [[ -n "${CONTAINER_CLI:-}" ]]; then
    if command -v "$CONTAINER_CLI" >/dev/null 2>&1; then
      echo "$CONTAINER_CLI"
      return
    fi
    error "La CLI indicada en CONTAINER_CLI no existe: $CONTAINER_CLI"
    exit 1
  fi

  if command -v podman >/dev/null 2>&1; then
    echo "podman"
    return
  fi

  if command -v docker >/dev/null 2>&1; then
    echo "docker"
    return
  fi

  error "No se encontró ni docker ni podman en el sistema."
  exit 1
}

# ---------- Cargar Variables de Entorno ----------
load_env_file() {
  local env_file="$1"

  if [[ ! -f "$env_file" ]]; then
    warn "No se encontró $env_file. Usando variables por defecto."
    return
  fi

  log "Cargando configuración desde $env_file ..."
  # Exportar variables ignorando comentarios y líneas vacías
  while IFS='=' read -r key value; do
    [[ "$key" =~ ^#.*$ ]] && continue
    [[ -z "$key" ]] && continue
    # Quitar posibles comillas
    value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
    export "$key=$value"
  done < "$env_file"
}

# ---------- Validar contexto ----------
has_valid_context() {
  local context_dir="$1"
  [[ -d "$context_dir" && -f "$context_dir/Dockerfile" ]]
}

# ---------- Argumentos ----------
ACTION="all"
TARGET_SERVICE=""

if [[ $# -ge 1 ]]; then
  case "$1" in
    build|push|all) ACTION="$1" ;;
    -h|--help) usage; exit 0 ;;
    *) error "Acción inválida: $1"; usage; exit 1 ;;
  esac
fi

if [[ $# -ge 2 ]]; then
  TARGET_SERVICE="$2"
fi

# Cargar configuración
ENV_FILE="${ENV_FILE:-$DEFAULT_ENV_FILE}"
load_env_file "$ENV_FILE"

DOCKERHUB_USER="${DOCKERHUB_USER:-$DEFAULT_DOCKERHUB_USER}"
DOCKERHUB_PASS="${DOCKERHUB_PASS:-}"

# Solicitar credenciales si faltan o son el valor por defecto
if [[ "$DOCKERHUB_USER" == "tu_usuario" || -z "$DOCKERHUB_USER" ]]; then
  read -p "Ingrese su usuario de Docker Hub: " DOCKERHUB_USER
fi

if [[ -z "$DOCKERHUB_PASS" ]]; then
  read -sp "Ingrese su contraseña/token de Docker Hub: " DOCKERHUB_PASS
  echo "" # Nueva línea tras el input oculto
fi

VERSION="${VERSION:-$DEFAULT_VERSION}"
REGISTRY="${REGISTRY:-$DEFAULT_REGISTRY}"
CLI="$(detect_container_cli)"

# ---------- Servicios ----------
# Formato: "nombre_imagen|directorio_contexto"
SERVICES=(
  "simcomp-auth-db|./backend/ms-auth-service/db"
  "simcomp-personas-db|./backend/ms-personas/db"
  "simcomp-automotores-db|./backend/ms-automotores/db"
  "simcomp-infracciones-db|./backend/ms-infracciones/db"
  "simcomp-comparendos-db|./backend/ms-comparendos/db"
  "simcomp-reportes-db|./backend/ms-reportes/db"

  "simcomp-auth-service|./backend/ms-auth-service"
  "simcomp-personas-service|./backend/ms-personas"
  "simcomp-automotores-service|./backend/ms-automotores"
  "simcomp-infracciones-service|./backend/ms-infracciones"
  "simcomp-comparendos-service|./backend/ms-comparendos"
  "simcomp-reportes-service|./backend/ms-reportes"

  "simcomp-frontend|./frontend"
  "simcomp-gateway|./provisioning_docker/nginx"
  "simcomp-haproxy-balance|./haproxy"
)

# Filtrar servicios si se especificó uno
if [[ -n "$TARGET_SERVICE" ]]; then
  NEW_SERVICES=()
  FOUND=false
  for item in "${SERVICES[@]}"; do
    IFS='|' read -r image_name _ <<< "$item"
    if [[ "$image_name" == "$TARGET_SERVICE" ]]; then
      NEW_SERVICES+=("$item")
      FOUND=true
      break
    fi
  done
  if [[ "$FOUND" == "false" ]]; then
    error "Servicio no encontrado: $TARGET_SERVICE"
    exit 1
  fi
  SERVICES=("${NEW_SERVICES[@]}")
  log "Filtrado para procesar solo: $TARGET_SERVICE"
fi

BUILT_SERVICES=()

login_registry() {
  log "Autenticando en $REGISTRY con $CLI ..."
  if [[ -n "$DOCKERHUB_PASS" ]]; then
    echo "$DOCKERHUB_PASS" | "$CLI" login "$REGISTRY" -u "$DOCKERHUB_USER" --password-stdin
    ok "Autenticación automática completada."
  else
    warn "DOCKERHUB_PASS no definido. Se requerirá login manual."
    "$CLI" login "$REGISTRY"
  fi
}

build_images() {
  local item image_name context_dir version_tag latest_tag

  for item in "${SERVICES[@]}"; do
    IFS='|' read -r image_name context_dir <<< "$item"

    if ! has_valid_context "$context_dir"; then
      warn "Saltando $image_name: no existe el contexto o falta Dockerfile en $context_dir"
      continue
    fi

    version_tag="$REGISTRY/$DOCKERHUB_USER/$image_name:$VERSION"
    latest_tag="$REGISTRY/$DOCKERHUB_USER/$image_name:latest"

    log "Construyendo $image_name ..."
    "$CLI" build -t "$version_tag" "$context_dir"
    "$CLI" tag "$version_tag" "$latest_tag"

    BUILT_SERVICES+=("$item")
    ok "$image_name construido."
  done
}

push_images() {
  local items_to_push=()

  if [[ ${#BUILT_SERVICES[@]} -gt 0 ]]; then
    items_to_push=("${BUILT_SERVICES[@]}")
  else
    items_to_push=("${SERVICES[@]}")
  fi

  local item image_name context_dir version_tag latest_tag

  for item in "${items_to_push[@]}"; do
    IFS='|' read -r image_name context_dir <<< "$item"

    version_tag="$REGISTRY/$DOCKERHUB_USER/$image_name:$VERSION"
    latest_tag="$REGISTRY/$DOCKERHUB_USER/$image_name:latest"

    log "Subiendo $image_name ..."
    "$CLI" push "$version_tag"
    "$CLI" push "$latest_tag"
    ok "$image_name subido."
  done
}

main() {
  log "CLI: $CLI | Usuario: $DOCKERHUB_USER | Versión: $VERSION | Acción: $ACTION"

  case "$ACTION" in
    build)
      build_images
      ;;
    push)
      login_registry
      push_images
      ;;
    all)
      login_registry
      build_images
      push_images
      ;;
  esac

  echo
  ok "Proceso finalizado correctamente."
}

main "$@"