#!/bin/bash
set -e

if [ $# -lt 2 ]; then
  echo "Uso: ./join-worker.sh <TOKEN> <MANAGER_IP>"
  exit 1
fi

TOKEN=$1
MANAGER_IP=$2

docker swarm join --token "${TOKEN}" "${MANAGER_IP}:2377"