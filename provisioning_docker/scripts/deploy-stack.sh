#!/bin/bash
set -e

STACK_NAME=${1:-simcomp}

cd "$(dirname "$0")/.."

echo "[INFO] Desplegando stack ${STACK_NAME}"
docker stack deploy -c stack.yml "${STACK_NAME}"

echo
echo "[INFO] Servicios"
docker stack services "${STACK_NAME}"

echo
echo "[INFO] Tareas"
docker stack ps "${STACK_NAME}"