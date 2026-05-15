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
    echo "  [3] Instalar Dependencias del Proyecto (pnpm/npm)"
    echo "  [4] Instalar Node.js (npm)"
    echo "  [5] Instalar Python 3"
    echo "  [6] Instalar Java (OpenJDK 17)"
    echo "  [7] Instalar Apache JMeter"
    echo "  [8] Instalar HashiCorp Vagrant"
    echo "  [9] Instalar Oracle VirtualBox"
    echo "  [10] Configurar Red VirtualBox (Host-Only)"
    
    echo -e "${YELLOW} INFRAESTRUCTURA Y DESPLIEGUE:${NC}"
    echo "  [11] Gestionar Swarm/Vagrant (Cluster)"
    echo "  [12] Gestionar Entorno Local (Docker Full)"
    echo "  [13] Gestionar Entorno Local (Nativo)"
    echo "  [14] Compilar Imágenes Docker (Build)"

    echo -e "${YELLOW} PRUEBAS Y CALIDAD:${NC}"
    echo "  [15] Ejecutar Pruebas JMeter (Load Testing)"
    echo "  [16] Sincronizar Ramas Microservicios (Git)"

    echo -e "${YELLOW} MANTENIMIENTO:${NC}"
    echo "  [17] Reparar Permisos de Ejecución (+x)"
    
    echo -e "${BLUE}----------------------------------------------------${NC}"
    echo "  [q] Salir"
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
            bash ./scripts/install-node.sh
            ;;
        5)
            bash ./scripts/install-python.sh
            ;;
        6)
            bash ./scripts/install-java.sh
            ;;
        7)
            bash ./scripts/install-jmeter.sh
            ;;
        8)
            bash ./scripts/install-vagrant.sh
            ;;
        9)
            bash ./scripts/install-virtualbox.sh
            ;;
        10)
            bash ./scripts/setup-vbox-network.sh
            ;;
        11)
            bash ./scripts/vagrant-manager.sh
            ;;
        12)
            bash ./scripts/local-docker-manager.sh
            ;;
        13)
            bash ./scripts/local-manager.sh
            ;;
        14)
            bash ./scripts/build-manager.sh
            ;;
        15)
            bash ./scripts/vagrant-manager.sh 7
            ;;
        16)
            echo " [!] Iniciando Sincronización de Ramas..."
            git checkout dev
            branches=("frontend" "ms-auth-service" "ms-automotores" "ms-comparendos" "ms-infracciones" "ms-personas" "ms-reportes" "analytics-spark-service")
            for b in "${branches[@]}"; do
                echo " --- Procesando $b ---"
                PREFIX=$([[ $b == ms-* ]] && echo "backend/$b" || echo "$b")
                
                # Eliminamos la rama local si existe para evitar conflictos
                git branch -D "$b" 2>/dev/null
                
                # Extraemos el subdirectorio de forma limpia sin dañar el historial
                git subtree split --prefix="$PREFIX" -b "$b"
                
                # Subimos forzadamente la rama que contiene SOLAMENTE el microservicio
                git push origin "$b" --force
            done
            git checkout dev
            echo " [✔] Repositorio sincronizado."
            ;;
        17)
            bash ./scripts/fix-permissions.sh
            ;;
        q|Q) exit 0 ;;
        *) echo " Opción inválida." ;;
    esac
    read -p " Presiona Enter para continuar..."
    main_menu
}

main_menu
