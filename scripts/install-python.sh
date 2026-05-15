#!/bin/bash
# SIMCOMP - INSTALACIÓN DE PYTHON 3
set -e

# Colores
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}====================================================${NC}"
echo -e "       INSTALACIÓN DE PYTHON 3"
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
        sudo pacman -S --noconfirm python python-pip
        ;;
    debian|ubuntu)
        sudo apt-get update
        sudo apt-get install -y python3 python3-pip
        ;;
    fedora)
        sudo dnf install -y python3 python3-pip
        ;;
    *)
        if [[ "$ID_LIKE" == *"arch"* ]]; then
            sudo pacman -S --noconfirm python python-pip
        elif [[ "$ID_LIKE" == *"debian"* ]] || [[ "$ID_LIKE" == *"ubuntu"* ]]; then
            sudo apt-get update
            sudo apt-get install -y python3 python3-pip
        elif [[ "$ID_LIKE" == *"fedora"* ]]; then
            sudo dnf install -y python3 python3-pip
        else
            echo -e "${RED} [X] Distribución '$OS' no soportada por este script.${NC}"
            exit 1
        fi
        ;;
esac

echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN} [✔] Python 3 instalado correctamente.${NC}"
echo -e "${GREEN}====================================================${NC}"
