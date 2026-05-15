#!/bin/bash
# SIMCOMP - INSTALACIÓN DE NODE.JS
set -e

# Colores
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}====================================================${NC}"
echo -e "       INSTALACIÓN DE NODE.JS (LTS)"
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
        sudo pacman -S --noconfirm nodejs npm
        ;;
    debian|ubuntu)
        sudo apt-get update
        sudo apt-get install -y nodejs npm
        ;;
    fedora)
        sudo dnf install -y nodejs
        ;;
    *)
        if [[ "$ID_LIKE" == *"arch"* ]]; then
            sudo pacman -S --noconfirm nodejs npm
        elif [[ "$ID_LIKE" == *"debian"* ]] || [[ "$ID_LIKE" == *"ubuntu"* ]]; then
            sudo apt-get update
            sudo apt-get install -y nodejs npm
        elif [[ "$ID_LIKE" == *"fedora"* ]]; then
            sudo dnf install -y nodejs
        else
            echo -e "${RED} [X] Distribución '$OS' no soportada por este script.${NC}"
            exit 1
        fi
        ;;
esac

echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN} [✔] Node.js instalado correctamente.${NC}"
echo -e "${GREEN}====================================================${NC}"
