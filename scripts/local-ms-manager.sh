#!/usr/bin/env bash
# local-ms-manager.sh - Gestión de microservicios en local (Host)
# =============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="${BASE_DIR}/backend"

SERVICES=(
  "frontend"
  "ms-auth-service"
  "ms-personas"
  "ms-automotores"
  "ms-infracciones"
  "ms-comparendos"
  "ms-reportes"
)

# Puertos por defecto
declare -A PORTS
PORTS["frontend"]=5173
PORTS["ms-auth-service"]=8001
PORTS["ms-personas"]=8002
PORTS["ms-automotores"]=8003
PORTS["ms-infracciones"]=8004
PORTS["ms-comparendos"]=8005
PORTS["ms-reportes"]=8006

log() { echo -e "${BLUE}[*] $1${NC}"; }
ok() { echo -e "${GREEN}[✔] $1${NC}"; }
err() { echo -e "${RED}[!] $1${NC}"; }

check_deps() {
    if ! command -v node &>/dev/null; then
        err "Node.js no está instalado."
        exit 1
    fi
}

stop_service() {
    local service=$1
    local port=${PORTS[$service]}
    if [ -n "$port" ]; then
        local pid=$(lsof -t -i:$port)
        if [ -n "$pid" ]; then
            log "Deteniendo $service (PID: $pid)..."
            kill -9 $pid
            ok "$service detenido."
        else
            log "$service no parece estar ejecutándose en el puerto $port."
        fi
    fi
}

start_service() {
    local service=$1
    log "Iniciando $service..."
    
    if [ "$service" == "frontend" ]; then
        cd "${BASE_DIR}/frontend" || { err "Directorio frontend no encontrado"; return 1; }
    else
        cd "${BACKEND_DIR}/$service" || { err "Directorio $service no encontrado"; return 1; }
    fi
    
    # Usar pnpm si está disponible, si no npm
    if command -v pnpm &>/dev/null; then
        nohup pnpm dev > "${BASE_DIR}/logs/${service}.log" 2>&1 &
    else
        nohup npm run dev > "${BASE_DIR}/logs/${service}.log" 2>&1 &
    fi
    
    ok "$service iniciado en segundo plano. Logs en logs/${service}.log"
}

status() {
    echo -e "${YELLOW}Estado de servicios:${NC}"
    printf "%-25s %-10s %-10s\n" "SERVICIO" "PUERTO" "ESTADO"
    echo "----------------------------------------------------"
    for s in "${SERVICES[@]}"; do
        local port=${PORTS[$s]}
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
            printf "%-25s %-10s ${GREEN}%-10s${NC}\n" "$s" "$port" "RUNNING"
        else
            printf "%-25s %-10s ${RED}%-10s${NC}\n" "$s" "$port" "STOPPED"
        fi
    done
}

mkdir -p "${BASE_DIR}/logs"

case $1 in
    start)
        if [ "${2:-all}" == "all" ]; then
            for s in "${SERVICES[@]}"; do start_service "$s"; done
        else
            start_service "$2"
        fi
        ;;
    stop)
        if [ "${2:-all}" == "all" ]; then
            for s in "${SERVICES[@]}"; do stop_service "$s"; done
        else
            stop_service "$2"
        fi
        ;;
    status)
        status
        ;;
    *)
        echo "Uso: $0 {start|stop|status} [servicio|all]"
        exit 1
        ;;
esac
