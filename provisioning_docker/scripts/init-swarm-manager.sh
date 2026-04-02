#!/bin/bash
set -e

MANAGER_IP=${1:-192.168.100.2}

echo "[INFO] Inicializando swarm en ${MANAGER_IP}"
docker swarm init --advertise-addr "${MANAGER_IP}" || true

echo
echo "[INFO] Token para unir workers:"
docker swarm join-token worker

echo
echo "[INFO] Nodos del cluster:"
docker node ls