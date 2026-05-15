#!/bin/bash
# SIMCOMP - INSTALACIÓN DE ORACLE VIRTUALBOX
set -e

# Colores
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}====================================================${NC}"
echo -e "       INSTALACIÓN DE ORACLE VIRTUALBOX"
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
        # Nota: Arch requiere elegir entre virtualbox-host-modules-arch o virtualbox-host-dkms
        echo -e "[*] Instalando VirtualBox y módulos DKMS..."
        sudo pacman -S --noconfirm virtualbox virtualbox-host-dkms linux-headers
        ;;
    debian|ubuntu)
        sudo apt-get update
        sudo apt-get install -y virtualbox virtualbox-ext-pack
        ;;
    fedora)
        sudo dnf install -y VirtualBox
        ;;
    *)
        if [[ "$ID_LIKE" == *"arch"* ]]; then
            sudo pacman -S --noconfirm virtualbox virtualbox-host-dkms linux-headers
        elif [[ "$ID_LIKE" == *"debian"* ]] || [[ "$ID_LIKE" == *"ubuntu"* ]]; then
            sudo apt-get update
            sudo apt-get install -y virtualbox
        elif [[ "$ID_LIKE" == *"fedora"* ]]; then
            sudo dnf install -y VirtualBox
        else
            echo -e "${RED} [X] Distribución '$OS' no soportada por este script.${NC}"
            exit 1
        fi
        ;;
esac

echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN} [✔] VirtualBox instalado correctamente.${NC}"
echo -e "${GREEN}====================================================${NC}"
