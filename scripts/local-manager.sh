#!/usr/bin/env bash
# local-manager.sh - Sub-menú para gestión local nativa
# =============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

local_menu() {
    clear
    echo -e "${BLUE}====================================================${NC}"
    echo -e "${BLUE}       SIMCOMP - GESTIÓN ENTORNO LOCAL (NATIVO)${NC}"
    echo -e "${BLUE}====================================================${NC}"
    echo -e "${YELLOW} BASES DE DATOS (DOCKER):${NC}"
    echo "  [1] Iniciar Todas las DBs"
    echo "  [2] Detener Todas las DBs"
    echo "  [3] Resetear DBs (Borrar Datos y Recrear)"
    echo "  [4] Limpiar/Purgar Todo (Docker Down -v)"
    echo "  [5] Ver Estado DBs"
    echo -e "${YELLOW} MICROSERVICIOS (NODE.JS):${NC}"
    echo "  [6] Iniciar Todos los Microservicios"
    echo "  [7] Detener Todos los Microservicios"
    echo "  [8] Gestionar Servicio Individual (Sub-menú)"
    echo "  [9] Ver Estado Microservicios"
    echo "  [10] Ver Enlaces/URLs de Acceso"
    echo -e "${BLUE}----------------------------------------------------${NC}"
    echo "  [0] Regresar al Menú Principal"
    echo -e "${BLUE}----------------------------------------------------${NC}"
    read -p " Selecciona una opción: " LOPT

    case $LOPT in
        1) bash ./scripts/local-db-manager.sh start ;;
        2) bash ./scripts/local-db-manager.sh stop ;;
        3) bash ./scripts/local-db-manager.sh reset ;;
        4) bash ./scripts/local-db-manager.sh purge ;;
        5) bash ./scripts/local-db-manager.sh status ;;
        6) bash ./scripts/local-ms-manager.sh start ;;
        7) bash ./scripts/local-ms-manager.sh stop ;;
        8) individual_menu ;;
        9) bash ./scripts/local-ms-manager.sh status ;;
        10) show_links ;;
        0) return ;;
        *) echo " Opción inválida." ;;
    esac
    read -p " Presiona Enter para continuar..."
    local_menu
}

show_links() {
    echo -e "${YELLOW}--- Enlaces de Acceso Local ---${NC}"
    echo -e "Frontend:     ${GREEN}http://localhost:5173${NC}"
    echo -e "----------------------------------------------------"
    echo -e "${YELLOW}APIs (Documentación Swagger):${NC}"
    echo -e "Auth:         ${BLUE}http://localhost:8001/api/docs${NC}"
    echo -e "Personas:     ${BLUE}http://localhost:8002/api/docs${NC}"
    echo -e "Automotores:  ${BLUE}http://localhost:8003/api/docs${NC}"
    echo -e "Infracciones: ${BLUE}http://localhost:8004/api/docs${NC}"
    echo -e "Comparendos:  ${BLUE}http://localhost:8005/api/docs${NC}"
    echo -e "Reportes:     ${BLUE}http://localhost:8006/api/docs${NC}"
    echo -e "----------------------------------------------------"
}

individual_menu() {
    echo -e "${YELLOW}--- Gestión Individual ---${NC}"
    echo "  [1] frontend"
    echo "  [2] ms-auth-service"
    echo "  [3] ms-personas"
    echo "  [4] ms-automotores"
    echo "  [5] ms-infracciones"
    echo "  [6] ms-comparendos"
    echo "  [7] ms-reportes"
    echo "  [0] Cancelar"
    read -p "Selecciona un servicio: " SNUM
    
    case $SNUM in
        1) SNAME="frontend" ;;
        2) SNAME="ms-auth-service" ;;
        3) SNAME="ms-personas" ;;
        4) SNAME="ms-automotores" ;;
        5) SNAME="ms-infracciones" ;;
        6) SNAME="ms-comparendos" ;;
        7) SNAME="ms-reportes" ;;
        0) return ;;
        *) echo "Opción inválida."; return ;;
    esac

    echo -e "\nServicio seleccionado: ${BLUE}$SNAME${NC}"
    echo "  [1] Iniciar"
    echo "  [2] Detener"
    if [[ "$SNAME" == ms-* ]]; then
        echo "  [3] Reset DB (Docker)"
    fi
    echo "  [0] Cancelar"
    read -p "Acción: " SACT
    
    case $SACT in
        1) bash ./scripts/local-ms-manager.sh start "$SNAME" ;;
        2) bash ./scripts/local-ms-manager.sh stop "$SNAME" ;;
        3) 
            if [[ "$SNAME" == ms-* ]]; then
                bash ./scripts/local-db-manager.sh reset "$SNAME"
            else
                echo "Este servicio no tiene una base de datos asociada."
            fi
            ;;
        0|*) echo "Acción cancelada." ;;
    esac
}

local_menu
