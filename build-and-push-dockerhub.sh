#!/usr/bin/env bash
set -Eeuo pipefail

# =========================================================
# SIMCOMP - Build & Push to Docker Hub
# Compatible con Docker y Podman
# Linux / macOS / WSL
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

CLI="${CONTAINER_CLI:-$(detect_container_cli)}"

# ---------- Validar proyecto ----------
if [[ ! -d "./backend" || ! -d "./frontend" ]]; then
  error "Debes ejecutar este script desde la raíz del proyecto simcomp."
  exit 1
fi

# ---------- Variables de entorno ----------
DOCKERHUB_USER="${DOCKERHUB_USER:-}"
VERSION="${VERSION:-$DEFAULT_VERSION}"
REGISTRY="${REGISTRY:-$DEFAULT_REGISTRY}"

if [[ -z "$DOCKERHUB_USER" || "$DOCKERHUB_USER" == "TU_USUARIO_DOCKERHUB" ]]; then
  error "Debes definir DOCKERHUB_USER. Ejemplo:"
  echo "  export DOCKERHUB_USER=deytonro"
  echo "  export VERSION=v1.0.0"
  echo "  ./build-and-push-dockerhub.sh"
  exit 1
fi

# ---------- Servicios ----------
SERVICES=(
  "simcomp-auth-service:./backend/ms-auth-service"
  "simcomp-personas-service:./backend/ms-personas"
  "simcomp-automotores-service:./backend/ms-automotores"
  "simcomp-infracciones-service:./backend/ms-infracciones"
  "simcomp-comparendos-service:./backend/ms-comparendos"
  "simcomp-reportes-service:./backend/ms-reportes"
  "simcomp-frontend:./frontend"
)

# ---------- Login ----------
login_registry() {
  log "Usando CLI: $CLI"
  log "Autenticando en $REGISTRY"

  if [[ -n "${DOCKERHUB_TOKEN:-}" ]]; then
    if [[ -z "${DOCKERHUB_USER:-}" ]]; then
      error "Si usas DOCKERHUB_TOKEN, también debes definir DOCKERHUB_USER."
      exit 1
    fi

    printf '%s' "$DOCKERHUB_TOKEN" | "$CLI" login -u "$DOCKERHUB_USER" --password-stdin "$REGISTRY"
  else
    if [[ "$CLI" == "docker" ]]; then
      # En Docker Hub, si no das usuario, puede entrar en device code flow.
      # Para script reproducible es mejor forzar usuario si lo tenemos.
      "$CLI" login -u "$DOCKERHUB_USER" "$REGISTRY"
    else
      "$CLI" login -u "$DOCKERHUB_USER" "$REGISTRY"
    fi
  fi

  ok "Login correcto en $REGISTRY"
}

# ---------- Build ----------
build_image() {
  local image_name="$1"
  local context_dir="$2"
  local version_tag="$REGISTRY/$DOCKERHUB_USER/$image_name:$VERSION"
  local latest_tag="$REGISTRY/$DOCKERHUB_USER/$image_name:latest"

  if [[ ! -d "$context_dir" ]]; then
    error "No existe el directorio: $context_dir"
    exit 1
  fi

  if [[ ! -f "$context_dir/Dockerfile" && ! -f "$context_dir/Containerfile" ]]; then
    error "No se encontró Dockerfile/Containerfile en: $context_dir"
    exit 1
  fi

  log "Construyendo $image_name desde $context_dir"
  "$CLI" build -t "$version_tag" "$context_dir"

  log "Etiquetando $image_name como latest"
  "$CLI" tag "$version_tag" "$latest_tag"

  ok "Build completado: $version_tag"
}

# ---------- Push ----------
push_image() {
  local image_name="$1"
  local version_tag="$REGISTRY/$DOCKERHUB_USER/$image_name:$VERSION"
  local latest_tag="$REGISTRY/$DOCKERHUB_USER/$image_name:latest"

  log "Subiendo $version_tag"
  "$CLI" push "$version_tag"

  log "Subiendo $latest_tag"
  "$CLI" push "$latest_tag"

  ok "Push completado: $image_name"
}

# ---------- Resumen ----------
print_summary() {
  echo
  ok "Listo: imágenes construidas y subidas a Docker Hub"
  echo
  echo "Repositorio:"
  for item in "${SERVICES[@]}"; do
    IFS=":" read -r image_name _ <<< "$item"
    echo "  - $REGISTRY/$DOCKERHUB_USER/$image_name:$VERSION"
    echo "  - $REGISTRY/$DOCKERHUB_USER/$image_name:latest"
  done
}

# ---------- Main ----------
main() {
  login_registry

  for item in "${SERVICES[@]}"; do
    IFS=":" read -r image_name context_dir <<< "$item"
    build_image "$image_name" "$context_dir"
  done

  for item in "${SERVICES[@]}"; do
    IFS=":" read -r image_name _ <<< "$item"
    push_image "$image_name"
  done

  print_summary
}

main "$@"