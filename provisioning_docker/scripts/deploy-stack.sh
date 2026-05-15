#!/bin/bash
# deploy-stack.sh — Despliega el stack SIMCOMP con espera de convergencia
set -e

STACK_NAME=${1:-simcomp}
cd "$(dirname "$0")/.."

echo "[INFO] Desplegando stack '${STACK_NAME}'..."
docker stack deploy \
  --with-registry-auth \
  --resolve-image always \
  -c stack.yml \
  "${STACK_NAME}"

echo ""
echo "[INFO] Esperando convergencia de servicios (30s)..."
sleep 30

echo ""
echo "[INFO] Servicios del stack:"
docker stack services "${STACK_NAME}"

echo ""
echo "[INFO] Tareas del stack:"
docker stack ps "${STACK_NAME}" --no-trunc 2>/dev/null | head -40