#!/usr/bin/env bash

# =========================================================
# SIMCOMP - Build & Push to Docker Hub
# Compatible con Docker y Podman
# Linux / Bash
# =========================================================

set -e

ACTION=${1:-all}
TARGET_SERVICE=${2:-""}

ENV_FILE=".env.docker-push"

# ---------- Colores ----------
info()  { echo -e "\e[36m[INFO]\e[0m  $1"; }
ok()    { echo -e "\e[32m[OK]\e[0m    $1"; }
warn()  { echo -e "\e[33m[WARN]\e[0m  $1"; }
fail()  { echo -e "\e[31m[ERROR]\e[0m $1"; exit 1; }

# ---------- Cargar .env ----------
load_env() {
  if [ ! -f "$ENV_FILE" ]; then
    warn "No se encontró $ENV_FILE, usando valores por defecto"
    return
  fi

  info "Cargando variables desde $ENV_FILE"
  export $(grep -v '^#' "$ENV_FILE" | xargs)
}

# ---------- Detectar CLI ----------
get_cli() {
  if command -v podman >/dev/null 2>&1; then
    echo "podman"
  elif command -v docker >/dev/null 2>&1; then
    echo "docker"
  else
    fail "No se encontró docker ni podman"
  fi
}

# ---------- Validar Dockerfile ----------
valid_context() {
  [ -d "$1" ] && [ -f "$1/Dockerfile" ]
}

# ---------- Config ----------
load_env

DOCKERHUB_USER=${DOCKERHUB_USER:-"tu_usuario"}
VERSION=${VERSION:-"v1.0.0"}
REGISTRY=${REGISTRY:-"docker.io"}

CLI=$(get_cli)

# ---------- Servicios ----------
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
"simcomp-haproxy-balance|./provisioning_docker/haproxy"
)

BUILT=()

# ---------- Filtrar servicio ----------
if [ -n "$TARGET_SERVICE" ]; then
  SERVICES=($(printf "%s\n" "${SERVICES[@]}" | grep "^$TARGET_SERVICE|"))
  [ ${#SERVICES[@]} -eq 0 ] && fail "Servicio no encontrado: $TARGET_SERVICE"
  info "Filtrado: $TARGET_SERVICE"
fi

# ---------- Login ----------
login_registry() {
  if [ -z "$DOCKERHUB_PASS" ]; then
    warn "Sin DOCKERHUB_PASS → usa docker login manual"
    return
  fi

  echo "$DOCKERHUB_PASS" | $CLI login "$REGISTRY" -u "$DOCKERHUB_USER" --password-stdin
}

# ---------- Build ----------
build_images() {
  for svc in "${SERVICES[@]}"; do
    NAME="${svc%%|*}"
    CONTEXT="${svc##*|}"

    VERSION_TAG="$REGISTRY/$DOCKERHUB_USER/$NAME:$VERSION"
    LATEST_TAG="$REGISTRY/$DOCKERHUB_USER/$NAME:latest"

    if ! valid_context "$CONTEXT"; then
      warn "Saltando $NAME (sin Dockerfile)"
      continue
    fi

    info "Construyendo $NAME ..."
    $CLI build -t "$VERSION_TAG" "$CONTEXT"
    $CLI tag "$VERSION_TAG" "$LATEST_TAG"

    BUILT+=("$svc")
    ok "$NAME construido"
  done
}

# ---------- Push ----------
push_images() {
  local LIST=("${BUILT[@]}")
  [ ${#LIST[@]} -eq 0 ] && LIST=("${SERVICES[@]}")

  for svc in "${LIST[@]}"; do
    NAME="${svc%%|*}"

    VERSION_TAG="$REGISTRY/$DOCKERHUB_USER/$NAME:$VERSION"
    LATEST_TAG="$REGISTRY/$DOCKERHUB_USER/$NAME:latest"

    info "Subiendo $NAME ..."
    $CLI push "$VERSION_TAG"
    $CLI push "$LATEST_TAG"

    ok "$NAME subido"
  done
}

# ---------- Ejecución ----------
info "CLI: $CLI | Usuario: $DOCKERHUB_USER | Versión: $VERSION | Acción: $ACTION"

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
  *)
    fail "Acción inválida: build | push | all"
    ;;
esac

echo ""
ok "Proceso finalizado"