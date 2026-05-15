#!/bin/bash
# SIMCOMP - CONFIGURACIÓN DE RED VIRTUALBOX (LINUX)
set -e

# Colores
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}====================================================${NC}"
echo -e "   CONFIGURACIÓN DE RED VIRTUALBOX (192.168.100.x)"
echo -e "${YELLOW}====================================================${NC}"

if ! command -v VBoxManage &> /dev/null; then
    echo -e "${RED} [X] VBoxManage no encontrado. Asegúrate de que VirtualBox esté instalado.${NC}"
    exit 1
fi

echo -e "[*] Verificando adaptadores Host-Only..."

# Verificar si ya existe un adaptador con la IP 192.168.100.1
ADAPTER=$(ip addr | grep "192.168.100.1" | awk '{print $NF}')

if [ -n "$ADAPTER" ]; then
    echo -e "${GREEN} [OK] Se encontró el adaptador '$ADAPTER' configurado en 192.168.100.1${NC}"
else
    echo -e "[!] No se encontró un adaptador con la IP 192.168.100.1"
    echo -e "[*] Intentando configurar el adaptador vboxnet0..."
    
    # Verificar si vboxnet0 existe en VirtualBox
    if ! VBoxManage list hostonlyifs | grep -q "vboxnet0"; then
        echo -e "[*] Creando interfaz vboxnet0..."
        VBoxManage hostonlyif create
    fi
    
    # Configurar la IP
    echo -e "[*] Asignando IP 192.168.100.1 a vboxnet0..."
    VBoxManage hostonlyif ipconfig vboxnet0 --ip 192.168.100.1 --netmask 255.255.255.0
    
    echo -e "${GREEN} [OK] Red configurada exitosamente.${NC}"
fi

echo -e "${YELLOW}====================================================${NC}"
