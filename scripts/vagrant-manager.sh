#!/bin/bash

# Moverse a la raíz del proyecto
cd "$(dirname "$0")/.." || exit 1

echo "========================================================="
echo "  SIMCOMP - Gestor de Entornos Vagrant"
echo "========================================================="
echo "Seleccione el entorno que desea desplegar:"
echo "1) Vagrantfile_native (VMs tradicionales + Ansible)"
echo "2) Vagrantfile_docker_swarm (Cluster Swarm de 3 Nodos)"
echo "3) Vagrantfile_docker_swarm_spark (Cluster Swarm + Spark)"
echo "4) Salir"
echo -n "Opción (1-4): "
read opcion

case $opcion in
  1) archivo="vagrantfiles/Vagrantfile_native" ;;
  2) archivo="vagrantfiles/Vagrantfile_docker_swarm" ;;
  3) archivo="vagrantfiles/Vagrantfile_docker_swarm_spark" ;;
  4) echo "Saliendo..."; exit 0 ;;
  *) echo "Opción inválida."; exit 1 ;;
esac

echo "========================================================="
echo "Atención: Esto destruirá cualquier máquina Vagrant existente en este proyecto."
echo -n "¿Desea continuar y realizar una limpieza completa? (s/N): "
read confirmar

if [[ "$confirmar" != "s" && "$confirmar" != "S" ]]; then
  echo "Operación cancelada."
  exit 0
fi

echo "[*] Destruyendo máquinas existentes..."
if [ -f "Vagrantfile" ]; then
    vagrant destroy -f
fi

echo "[*] Eliminando la carpeta .vagrant para un inicio limpio..."
rm -rf .vagrant

echo "[*] Copiando $archivo a Vagrantfile..."
cp "$archivo" Vagrantfile

echo "========================================================="
echo "Iniciando 'vagrant up'..."
vagrant up
