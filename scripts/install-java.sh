#!/bin/bash
# SIMCOMP - INSTALACIÓN DE JAVA (OPENJDK 17)
set -e

# Colores
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}====================================================${NC}"
echo -e "       INSTALACIÓN DE JAVA (OPENJDK 17)"
echo -e "${YELLOW}====================================================${NC}"

if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo -e "${RED} [X] No se pudo detectar la distribución de Linux.${NC}"
    exit 1
fi

echo -e "[*] Detectado: $NAME"

case "$OS" in
    arch)
        sudo pacman -S --noconfirm jdk17-openjdk
        ;;
    debian|ubuntu)
        sudo apt-get update
        sudo apt-get install -y openjdk-17-jdk
        ;;
    fedora)
        sudo dnf install -y java-17-openjdk-devel
        ;;
    *)
        if [[ "$ID_LIKE" == *"arch"* ]]; then
            sudo pacman -S --noconfirm jdk17-openjdk
        elif [[ "$ID_LIKE" == *"debian"* ]] || [[ "$ID_LIKE" == *"ubuntu"* ]]; then
            sudo apt-get update
            sudo apt-get install -y openjdk-17-jdk
        elif [[ "$ID_LIKE" == *"fedora"* ]]; then
            sudo dnf install -y java-17-openjdk-devel
        else
            echo -e "${RED} [X] Distribución '$OS' no soportada por este script.${NC}"
            exit 1
        fi
        ;;
esac

echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN} [✔] Java 17 instalado correctamente.${NC}"
echo -e "${GREEN}====================================================${NC}"
