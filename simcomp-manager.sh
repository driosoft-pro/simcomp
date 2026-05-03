#!/bin/bash
# SIMCOMP - GESTOR CENTRAL DE INFRAESTRUCTURA (LINUX)

# ---------- Colores ----------
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

function main_menu() {
    clear
    echo -e "${BLUE}====================================================${NC}"
    echo -e "${BLUE}       SIMCOMP - PANEL DE CONTROL CENTRAL${NC}"
    echo -e "${BLUE}====================================================${NC}"
    
    echo -e "${YELLOW} CONFIGURACIÓN Y PREPARACIÓN:${NC}"
    echo "  [1] Configurar Entorno (.env y Secretos)"
    echo "  [2] Configurar DNS Local (/etc/hosts)"
    echo "  [3] Instalar Dependencias (pnpm/npm)"
    
    echo -e "${YELLOW} INFRAESTRUCTURA Y DESPLIEGUE:${NC}"
    echo "  [4] Gestionar Swarm/Vagrant (Cluster)"
    echo "  [5] Gestionar Entorno Local (Docker Full)"
    echo "  [6] Gestionar Entorno Local (Nativo)"
    echo "  [7] Compilar Imágenes Docker (Build)"

    echo -e "${YELLOW} PRUEBAS Y CALIDAD:${NC}"
    echo "  [8] Ejecutar Pruebas JMeter (Load Testing)"
    echo "  [9] Sincronizar Ramas Microservicios (Git)"

    echo -e "${YELLOW} MANTENIMIENTO:${NC}"
    echo "  [10] Reparar Permisos de Ejecución (+x)"
    
    echo -e "${BLUE}----------------------------------------------------${NC}"
    echo "  [0] Salir"
    echo -e "${BLUE}----------------------------------------------------${NC}"
    read -p " Selecciona una opción: " OPTION

    case $OPTION in
        1)
            bash ./scripts/build-envs.sh
            bash ./scripts/build-secrets.sh
            ;;
        2)
            sudo bash ./scripts/setup-hosts.sh
            ;;
        3)
            bash ./scripts/install-deps.sh
            ;;
        4)
            bash ./scripts/vagrant-manager.sh
            ;;
        5)
            bash ./scripts/local-docker-manager.sh
            ;;
        6)
            bash ./scripts/local-manager.sh
            ;;
        7)
            bash ./scripts/build-manager.sh
            ;;
        8)
            bash ./scripts/vagrant-manager.sh 7
            ;;
        9)
            echo " [!] Iniciando Sincronización de Ramas..."
            git checkout dev
            branches=("frontend" "ms-auth-service" "ms-automotores" "ms-comparendos" "ms-infracciones" "ms-personas" "ms-reportes" "analytics-spark-service")
            for b in "${branches[@]}"; do
                echo " --- Procesando $b ---"
                git checkout -B $b dev
                git filter-branch --subdirectory-filter "$([[ $b == ms-* ]] && echo backend/$b || echo $b)" --force
                git push origin $b --force
            done
            git checkout dev
            echo " [✔] Repositorio sincronizado."
            ;;
        10)
            bash ./scripts/fix-permissions.sh
            ;;
        0) exit 0 ;;
        *) echo " Opción inválida." ;;
    esac
    read -p " Presiona Enter para continuar..."
    main_menu
}

main_menu
