#!/usr/bin/env bash
# local-docker-manager.sh - Gestión del entorno completo vía Docker Compose
# =============================================================================

BLUE='\033[0;34m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

detect_engine() {
    if command -v podman >/dev/null 2>&1; then
        echo "podman"
    else
        echo "docker"
    fi
}

ENGINE=$(detect_engine)

docker_menu() {
    clear
    echo -e "${BLUE}====================================================${NC}"
    echo -e "${BLUE}       SIMCOMP - GESTIÓN ENTORNO DOCKER (FULL)${NC}"
    echo -e "${BLUE}====================================================${NC}"
    echo "  [1] Levantar todo el stack (Up -d)"
    echo "  [2] Detener todo el stack (Stop)"
    echo "  [3] Reiniciar stack (Restart)"
    echo "  [4] Bajar stack y borrar volúmenes (Down -v)"
    echo "  [5] Ver estado de contenedores (PS)"
    echo "  [6] Ver logs (Tail)"
    echo "  [7] Ver Enlaces/URLs de Acceso"
    echo -e "${BLUE}----------------------------------------------------${NC}"
    echo "  [0] Regresar al Menú Principal"
    echo -e "${BLUE}----------------------------------------------------${NC}"
    read -p " Selecciona una opción: " DOPT

    case $DOPT in
        1) 
            echo -e "${YELLOW}[*] Levantando stack con $ENGINE...${NC}"
            $ENGINE compose up -d --build
            show_links
            ;;
        2) 
            echo -e "${YELLOW}[*] Deteniendo stack...${NC}"
            $ENGINE compose stop 
            ;;
        3) 
            echo -e "${YELLOW}[*] Reiniciando stack...${NC}"
            $ENGINE compose restart 
            ;;
        4) 
            echo -e "${YELLOW}[*] Bajando stack y limpiando volúmenes...${NC}"
            $ENGINE compose down -v 
            ;;
        5) 
            echo -e "${YELLOW}[*] Estado de los contenedores:${NC}"
            $ENGINE compose ps 
            ;;
        6) 
            echo -e "${YELLOW}[*] Mostrando logs (Ctrl+C para salir)...${NC}"
            $ENGINE compose logs -f --tail 50 
            ;;
        7)
            show_links
            ;;
        0) return ;;
        *) echo " Opción inválida." ;;
    esac
    read -p " Presiona Enter para continuar..."
    docker_menu
}

show_links() {
    echo -e "${YELLOW}--- Enlaces de Acceso Docker (Full Stack) ---${NC}"
    echo -e "Frontend (HAProxy): ${GREEN}http://localhost:8080${NC}"
    echo -e "Dashboard Stats:    ${BLUE}http://localhost:8404/stats${NC} (admin:Admin123*)"
    echo -e "----------------------------------------------------"
    echo -e "${YELLOW}Observabilidad:${NC}"
    echo -e "Grafana:            ${GREEN}http://localhost:3000${NC}"
    echo -e "Prometheus:         ${GREEN}http://localhost:9090${NC}"
    echo -e "Glances (Monitor):  ${GREEN}http://localhost:61208${NC}"
    echo -e "----------------------------------------------------"
    echo -e "${YELLOW}Documentación API (Swagger):${NC}"
    echo -e "Auth Service:       ${BLUE}http://localhost:8001/api-docs${NC}"
    echo -e "Personas:           ${BLUE}http://localhost:8002/api-docs${NC}"
    echo -e "Automotores:        ${BLUE}http://localhost:8003/api-docs${NC}"
    echo -e "Infracciones:       ${BLUE}http://localhost:8004/api-docs${NC}"
    echo -e "Comparendos:        ${BLUE}http://localhost:8005/api-docs${NC}"
    echo -e "Reportes:           ${BLUE}http://localhost:8006/api-docs${NC}"
    echo -e "----------------------------------------------------"
    echo -e "${YELLOW}Servicios Adicionales:${NC}"
    echo -e "Analytics API:      ${BLUE}http://localhost:8010${NC}"
    echo -e "Spark UI:           ${BLUE}http://localhost:4040${NC}"
    echo -e "----------------------------------------------------"
}

docker_menu
