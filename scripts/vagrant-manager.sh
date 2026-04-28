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
    # El '|| true' asegura que el script continúe aunque vagrant dé advertencias
    vagrant destroy -f || true
fi

echo "[*] Iniciando limpieza profunda de rastro de Vagrant..."
# 1. Intentar borrar de forma normal
rm -rf .vagrant/ 2>/dev/null

# 2. Si sigue existiendo, usar sudo (Libvirt/KVM a veces crea archivos de socket o logs como root)
if [ -d ".vagrant" ]; then
    echo "  --> Carpeta .vagrant persiste, solicitando permisos para limpieza total..."
    sudo rm -rf .vagrant/
fi

# Limpieza de tokens y rastros de red
rm -f provisioning_docker/.swarm-token 2>/dev/null
rm -f provisioning_docker/.swarm-manager-ip 2>/dev/null
echo "[✔] Limpieza de directorio .vagrant completada."

echo "[*] Copiando $archivo a Vagrantfile..."
cp "$archivo" Vagrantfile

echo "========================================================="
if [ "$opcion" == "1" ]; then
    echo "Iniciando entorno Nativo (Vagrant + Ansible)..."
    vagrant up
else
    echo "Iniciando máquinas virtuales (Worker1 -> Worker2 -> Manager)..."
    vagrant up workerDocker1 --no-provision
    vagrant up workerDocker2 --no-provision
    vagrant up managerDocker --no-provision

    echo ""
    echo "[*] Inicializando Docker Swarm en el Manager..."
    vagrant provision managerDocker --provision-with fix-dns,docker-install,swarm-init

    echo ""
    echo "[*] Uniendo Worker 1 al Swarm..."
    vagrant provision workerDocker1

    echo ""
    echo "[*] Uniendo Worker 2 al Swarm..."
    vagrant provision workerDocker2

    echo ""
    echo "[*] Desplegando el Stack de la aplicación en el Manager..."
    vagrant provision managerDocker --provision-with deploy-stack
    
    echo "========================================================="
    echo "¡Despliegue de Docker Swarm completado con éxito!"
fi
