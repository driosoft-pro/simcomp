#!/bin/bash
# SIMCOMP - INSTALACIÓN DE HASHICORP VAGRANT
set -e

# Colores
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}====================================================${NC}"
echo -e "       INSTALACIÓN DE HASHICORP VAGRANT"
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
        sudo pacman -S --noconfirm vagrant
        ;;
    debian|ubuntu)
        # HashiCorp tiene su propio repo, pero el de sistema suele ser suficiente para talleres
        sudo apt-get update
        sudo apt-get install -y vagrant
        ;;
    fedora)
        sudo dnf install -y vagrant
        ;;
    *)
        if [[ "$ID_LIKE" == *"arch"* ]]; then
            sudo pacman -S --noconfirm vagrant
        elif [[ "$ID_LIKE" == *"debian"* ]] || [[ "$ID_LIKE" == *"ubuntu"* ]]; then
            sudo apt-get update
            sudo apt-get install -y vagrant
        elif [[ "$ID_LIKE" == *"fedora"* ]]; then
            sudo dnf install -y vagrant
        else
            echo -e "${RED} [X] Distribución '$OS' no soportada por este script.${NC}"
            exit 1
        fi
        ;;
esac

echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN} [✔] Vagrant instalado correctamente.${NC}"
echo -e "${GREEN}====================================================${NC}"
