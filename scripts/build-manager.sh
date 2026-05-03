#!/usr/bin/env bash
# build-manager.sh - Sub-menú para construcción y subida de imágenes
# =============================================================================

BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

build_menu() {
    clear
    echo -e "${BLUE}====================================================${NC}"
    echo -e "${BLUE}       SIMCOMP - GESTIÓN DE IMÁGENES DOCKER${NC}"
    echo -e "${BLUE}====================================================${NC}"
    echo "  [1] Solo Construir (Build Local)"
    echo "  [2] Solo Subir (Push a Docker Hub)"
    echo "  [3] Todo (Login + Build + Push)"
    echo "  [4] Construir/Subir un servicio específico"
    echo -e "${BLUE}----------------------------------------------------${NC}"
    echo "  [0] Regresar al Menú Principal"
    echo -e "${BLUE}----------------------------------------------------${NC}"
    read -p " Selecciona una opción: " BOPT

    case $BOPT in
        1) bash ./scripts/build-and-push-dockerhub.sh build ;;
        2) bash ./scripts/build-and-push-dockerhub.sh push ;;
        3) bash ./scripts/build-and-push-dockerhub.sh all ;;
        4)
            read -p "Nombre del servicio (ej: simcomp-auth-service): " SNAME
            read -p "Acción (build/push/all): " SACT
            bash ./scripts/build-and-push-dockerhub.sh "$SACT" "$SNAME"
            ;;
        0) return ;;
        *) echo " Opción inválida." ;;
    esac
    read -p " Presiona Enter para continuar..."
    build_menu
}

build_menu
