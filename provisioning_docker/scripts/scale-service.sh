#!/bin/bash
set -e

if [ $# -lt 2 ]; then
  echo "Uso: ./scale-service.sh <servicio> <replicas>"
  echo "Ejemplo: ./scale-service.sh simcomp_ms-comparendos 5"
  exit 1
fi

SERVICE=$1
REPLICAS=$2

docker service scale "${SERVICE}=${REPLICAS}"

echo
echo "[INFO] Estado del servicio"
docker service ps "${SERVICE}"