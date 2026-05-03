#!/bin/bash
# SIMCOMP - Configurador de DNS Local (Linux)
# Uso: sudo ./setup-hosts.sh

IP_MANAGER="192.168.100.2"
DOMAINS="simcomp.co www.simcomp.co api.simcomp.co stats.simcomp.co monitor.simcomp.co spark.simcomp.co"

if grep -q "simcomp.co" /etc/hosts; then
    echo " [!] El dominio simcomp.co ya está presente en /etc/hosts"
    echo " [?] ¿Deseas actualizarlo? (s/n)"
    read -r response
    if [ "$response" != "s" ]; then
        exit 0
    fi
    sudo sed -i "/simcomp.co/d" /etc/hosts
fi

echo "$IP_MANAGER $DOMAINS" | sudo tee -a /etc/hosts
echo " [✔] Archivo /etc/hosts actualizado correctamente."
