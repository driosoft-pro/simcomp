#!/usr/bin/env bash
# local-db-manager.sh - Gestión de bases de datos locales (Corregido para multi-compose)
# =============================================================================

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="${BASE_DIR}/backend"

# Mapeo de directorios a nombres de servicio de base de datos en sus compose
declare -A DB_MAP
DB_MAP["ms-auth-service"]="db-ms-auth-service"
DB_MAP["ms-personas"]="db-ms-personas"
DB_MAP["ms-automotores"]="db-ms-automotores"
DB_MAP["ms-infracciones"]="db-ms-infracciones"
DB_MAP["ms-comparendos"]="db-ms-comparendos"

log() { echo -e "${BLUE}[*] $1${NC}"; }
ok() { echo -e "${GREEN}[✔] $1${NC}"; }
err() { echo -e "${RED}[!] $1${NC}"; }

detect_engine() {
    if command -v podman >/dev/null 2>&1; then
        echo "podman"
    else
        echo "docker"
    fi
}

ENGINE=$(detect_engine)

manage_db() {
    local action=$1
    local target=$2

    for dir in "${!DB_MAP[@]}"; do
        local service_name=${DB_MAP[$dir]}
        
        # Si se especificó un servicio y no es este, saltar
        if [ "$target" != "all" ] && [ "$target" != "$dir" ] && [ "$target" != "$service_name" ]; then
            continue
        fi

        if [ -d "${BACKEND_DIR}/${dir}" ]; then
            log "Ejecutando $action para $service_name en $dir..."
            cd "${BACKEND_DIR}/${dir}" || continue
            
            case $action in
                start)
                    log "Levantando contenedor para $service_name..."
                    $ENGINE compose up -d "$service_name"
                    log "Esperando a que $service_name esté listo..."
                    sleep 3
                    ;;
                stop)
                    $ENGINE compose stop "$service_name"
                    ;;
                restart)
                    $ENGINE compose restart "$service_name"
                    ;;
                reset)
                    $ENGINE compose down "$service_name" -v
                    $ENGINE compose up -d "$service_name"
                    sleep 3
                    ;;
                purge)
                    $ENGINE compose down -v
                    ;;
                status)
                    # podman-compose a veces falla si se le pasa el nombre del servicio al comando ps
                    if [ "$ENGINE" == "podman" ]; then
                        $ENGINE compose ps | grep "$service_name" || echo "No encontrado"
                    else
                        $ENGINE compose ps "$service_name"
                    fi
                    ;;
            esac
        fi
    done
}

ACTION=${1:-"status"}
TARGET=${2:-"all"}

manage_db "$ACTION" "$TARGET"
