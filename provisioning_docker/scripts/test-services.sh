#!/bin/bash
set -e

BASE_URL=${1:-http://192.168.100.2}

echo "[TEST] Frontend"
curl -I "${BASE_URL}"

echo
echo "[TEST] Auth health"
curl "${BASE_URL}/api/auth/health" || true

echo
echo "[TEST] Personas health"
curl "${BASE_URL}/api/personas/health" || true

echo
echo "[TEST] Automotores health"
curl "${BASE_URL}/api/automotores/health" || true

echo
echo "[TEST] Infracciones health"
curl "${BASE_URL}/api/infracciones/health" || true

echo
echo "[TEST] Comparendos health"
curl "${BASE_URL}/api/comparendos/health" || true