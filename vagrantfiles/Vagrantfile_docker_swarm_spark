# =============================================================================
# SIMCOMP — Vagrantfile (MULTI-PLATFORM & FULLY AUTOMATED)
# Compatible con Windows (VirtualBox) y Linux (Libvirt/KVM)
# Sistema de Comparendos de Tránsito
#
# Máquinas virtuales:
#   managerDocker  192.168.100.2  → Swarm Manager + HAProxy
#   workerDocker1  192.168.100.3  → Swarm Worker
#   workerDocker2  192.168.100.4  → Swarm Worker
#
# Imágenes:
#   Frontend:       deytonro/simcomp-frontend:latest
#   Microservicios: deytonro/simcomp-*:latest
#   Haproxy:        deytonro/simcomp-haproxy-balance
#   Spark:          deytonro/simcomp-analytics-spark  
#
# Uso:
#   vagrant up
#   Luego: vagrant provision managerDocker --provision-with deploy-stack
#   Acceder en: http://192.168.100.2
#   Stats:      http://192.168.100.2:8404/stats
#   Spark:      http://192.168.100.2:8010
#   Spark:      http://192.168.100.2:4040
# =============================================================================

# -*- mode: ruby -*-
# vi: set ft=ruby :

# --------------------------------------------------------------------------
# Scripts de Provisionamiento
# --------------------------------------------------------------------------

FIX_DNS = <<~'SHELL'
  set -e
  echo "[SIMCOMP] Configurando DNS..."
  systemctl disable systemd-resolved --now 2>/dev/null || true
  rm -f /etc/resolv.conf
  echo "nameserver 8.8.8.8" > /etc/resolv.conf
  echo "nameserver 8.8.4.4" >> /etc/resolv.conf
SHELL

DOCKER_INSTALL = <<~'SHELL'
  set -e
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -qq
  apt-get install -y -qq ca-certificates curl gnupg lsb-release apt-transport-https software-properties-common
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  usermod -aG docker vagrant
  systemctl enable docker
  systemctl start docker
SHELL

MANAGER_INIT = <<~'SHELL'
  set -e
  echo "[SIMCOMP] Configurando Firewall del Manager..."
  ufw allow 2377/tcp && ufw allow 7946/tcp && ufw allow 7946/udp && ufw allow 4789/udp && ufw allow 8000/tcp || true

  echo "[SIMCOMP] Inicializando Docker Swarm..."
  docker swarm init --advertise-addr 192.168.100.2 2>/dev/null || true
  
  # Guardamos el token
  docker swarm join-token worker -q > /tmp/swarm-token
  
  echo "[SIMCOMP] Compartiendo token en puerto 8000..."
  # Escuchar en todas las interfaces para mayor compatibilidad
  cd /tmp && nohup python3 -m http.server 8000 > /dev/null 2>&1 &
  sleep 2
SHELL

WORKER_JOIN = <<~'SHELL'
  set -e
  echo "[SIMCOMP] Intentando descargar token..."
  until curl -s -f http://192.168.100.2:8000/swarm-token > /tmp/swarm-token; do
    echo "  --> Error al conectar con http://192.168.100.2:8000. Reintentando..."
    sleep 5
  done
  
  WORKER_TOKEN=$(cat /tmp/swarm-token)
  echo "[SIMCOMP] ¡Token obtenido! Uniéndose al Swarm..."
  docker swarm join --token "$WORKER_TOKEN" 192.168.100.2:2377 2>/dev/null || true
SHELL

MANAGER_DEPLOY = <<~'SHELL'
  set -e
  echo "[SIMCOMP] Configurando secretos..."
  echo -n "admin123" | docker secret create db_password - 2>/dev/null || true
  echo -n "supersecretkey_auth_2026" | docker secret create jwt_secret - 2>/dev/null || true
  
  echo "[SIMCOMP] Esperando a que los 3 nodos (Manager + 2 Workers) estén 'Ready'..."
  until [ $(docker node ls 2>/dev/null | grep -c "Ready") -ge 3 ]; do
    echo "  --> Nodos actuales: $(docker node ls 2>/dev/null | grep -c "Ready" || echo 0)/3. Esperando..."
    sleep 5
  done

  cd /vagrant/provisioning_docker
  echo "[SIMCOMP] Cluster listo. Desplegando stack simcomp..."
  docker stack deploy -c stack.yml simcomp
  
  echo "[SIMCOMP] Finalizado. App en http://192.168.100.2"
SHELL

# --------------------------------------------------------------------------
# Configuración Vagrant
# --------------------------------------------------------------------------

Vagrant.configure("2") do |config|
  config.vm.box = "generic/ubuntu2204"
  config.vm.box_check_update = false

  # Carpeta del proyecto compartida
  config.vm.synced_folder ".", "/vagrant", disabled: false

  # Limpiar archivos de Swarm automáticamente en el Host antes de subir
  config.trigger.before :up do |trigger|
    trigger.info = "Limpiando rastro de Swarm previo..."
    trigger.ruby do |env,machine|
      File.delete("provisioning_docker/.swarm-token") if File.exist?("provisioning_docker/.swarm-token")
      File.delete("provisioning_docker/.swarm-manager-ip") if File.exist?("provisioning_docker/.swarm-manager-ip")
    end
  end

  # --- Manager ---
  config.vm.define "managerDocker", primary: true do |manager|
    manager.vm.hostname = "managerDocker"
    manager.vm.network "private_network", ip: "192.168.100.2"

    manager.vm.provider "virtualbox" do |vb|
      vb.name   = "SIMCOMP-Manager"
      vb.memory = 3072
      vb.cpus   = 2
      vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
      vb.customize ["modifyvm", :id, "--natdnsproxy1", "on"]
      vb.customize ["modifyvm", :id, "--natdnshostresolver2", "on"]
      vb.customize ["modifyvm", :id, "--nictype1", "virtio"]
    end

    manager.vm.provision "shell", name: "fix-dns",       inline: FIX_DNS
    manager.vm.provision "shell", name: "docker-install", inline: DOCKER_INSTALL
    manager.vm.provision "shell", name: "swarm-init",    inline: MANAGER_INIT
    manager.vm.provision "shell", name: "deploy-stack",  inline: MANAGER_DEPLOY
  end

  # --- Worker 1 ---
  config.vm.define "workerDocker1" do |worker1|
    worker1.vm.hostname = "workerDocker1"
    worker1.vm.network "private_network", ip: "192.168.100.3"

    worker1.vm.provider "virtualbox" do |vb|
      vb.name   = "SIMCOMP-Worker1"
      vb.memory = 4096
      vb.cpus   = 2
      vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
      vb.customize ["modifyvm", :id, "--natdnsproxy1", "on"]
      vb.customize ["modifyvm", :id, "--natdnshostresolver2", "on"]
      vb.customize ["modifyvm", :id, "--nictype1", "virtio"]
    end

    worker1.vm.provision "shell", name: "fix-dns",       inline: FIX_DNS
    worker1.vm.provision "shell", name: "docker-install", inline: DOCKER_INSTALL
    worker1.vm.provision "shell", name: "swarm-join",    inline: WORKER_JOIN
  end

  # --- Worker 2 ---
  config.vm.define "workerDocker2" do |worker2|
    worker2.vm.hostname = "workerDocker2"
    worker2.vm.network "private_network", ip: "192.168.100.4"

    worker2.vm.provider "virtualbox" do |vb|
      vb.name   = "SIMCOMP-Worker2"
      vb.memory = 4096
      vb.cpus   = 2
      vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
      vb.customize ["modifyvm", :id, "--natdnsproxy1", "on"]
      vb.customize ["modifyvm", :id, "--natdnshostresolver2", "on"]
      vb.customize ["modifyvm", :id, "--nictype1", "virtio"]
    end

    worker2.vm.provision "shell", name: "fix-dns",       inline: FIX_DNS
    worker2.vm.provision "shell", name: "docker-install", inline: DOCKER_INSTALL
    worker2.vm.provision "shell", name: "swarm-join",    inline: WORKER_JOIN
  end
end
