#!/usr/bin/env bash
set -Eeuo pipefail

# =========================================================
# SIMCOMP - Build & Push to Docker Hub
# Compatible con Docker y Podman
# =========================================================

# ---------- Configuración por defecto ----------
DEFAULT_VERSION="v1.0.0"
DEFAULT_REGISTRY="docker.io"

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

# ---------- Detectar herramienta ----------
detect_container_cli() {
  if command -v docker >/dev/null 2>&1; then
    echo "docker"
    return
  fi

  if command -v podman >/dev/null 2>&1; then
    echo "podman"
    return
  fi

  error "No se encontró ni docker ni podman en el sistema."
  exit 1
}

# ---------- Cargar Variables de Entorno ----------
if [[ -f ".env.docker-pus" ]]; then
  log "Cargando configuración desde .env.docker-pus..."
  # Exportar variables ignorando comentarios y líneas vacías
  export $(grep -v '^#' .env.docker-pus | xargs)
fi

# ---------- Variables de entorno ----------
DOCKERHUB_USER="${DOCKERHUB_USER:-deytonro}"
VERSION="${VERSION:-$DEFAULT_VERSION}"
REGISTRY="${REGISTRY:-$DEFAULT_REGISTRY}"
CLI="${CONTAINER_CLI:-$(detect_container_cli)}"


# ---------- Servicios ----------
# Formato: "nombre_imagen:directorio_contexto"
SERVICES=(
  "simcomp-auth-db:./backend/ms-auth-service/db"
  "simcomp-personas-db:./backend/ms-personas/db"
  "simcomp-automotores-db:./backend/ms-automotores/db"
  "simcomp-infracciones-db:./backend/ms-infracciones/db"
  "simcomp-comparendos-db:./backend/ms-comparendos/db"
  "simcomp-auth-service:./backend/ms-auth-service"
  "simcomp-personas-service:./backend/ms-personas"
  "simcomp-automotores-service:./backend/ms-automotores"
  "simcomp-infracciones-service:./backend/ms-infracciones"
  "simcomp-comparendos-service:./backend/ms-comparendos"
  "simcomp-reportes-service:./backend/ms-reportes"
  "simcomp-frontend:./frontend"
  "simcomp-gateway:./provisioning_docker/nginx"
  "simcomp-haproxy-balance:./haproxy"
)

# ---------- Build ----------
build_images() {
  for item in "${SERVICES[@]}"; do
    IFS=":" read -r image_name context_dir <<< "$item"
    local version_tag="$REGISTRY/$DOCKERHUB_USER/$image_name:$VERSION"
    local latest_tag="$REGISTRY/$DOCKERHUB_USER/$image_name:latest"

    if [[ ! -d "$context_dir" ]]; then
      warn "Saltando $image_name: No existe el directorio $context_dir"
      continue
    fi

    log "Construyendo $image_name..."
    "$CLI" build -t "$version_tag" -t "$latest_tag" "$context_dir"
    ok "$image_name construido."
  done
}

# ---------- Push ----------
push_images() {
  for item in "${SERVICES[@]}"; do
    IFS=":" read -r image_name _ <<< "$item"
    local version_tag="$REGISTRY/$DOCKERHUB_USER/$image_name:$VERSION"
    local latest_tag="$REGISTRY/$DOCKERHUB_USER/$image_name:latest"

    log "Subiendo $image_name..."
    "$CLI" push "$version_tag"
    "$CLI" push "$latest_tag"
    ok "$image_name subido."
  done
}

# ---------- Main ----------
main() {
  log "Usando CLI: $CLI | Usuario: $DOCKERHUB_USER | Versión: $VERSION"
  
  # Login
  log "Autenticando en $REGISTRY..."
  "$CLI" login "$REGISTRY"

  build_images
  push_images

  echo
  ok "Todo construido y subido correctamente a Docker Hub."
}

main "$@"