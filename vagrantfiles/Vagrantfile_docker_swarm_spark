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
# SIMCOMP — Vagrantfile (HYBRID NETWORK READY
# Compatible con VirtualBox y Libvirt/KVM
# =============================================================================
Vagrant.configure("2") do |config|
  config.vm.box = "generic/ubuntu2204"
  config.vm.box_check_update = false
  config.vm.synced_folder ".", "/vagrant"

# --------------------------------------------------------------------------
# VARIABLES (DESDE .env)
# --------------------------------------------------------------------------
NETWORK_MODE = ENV['NET_MODE'] || "private"

MANAGER_IP = ENV['MANAGER_IP'] || "192.168.100.2"
WORKER1_IP = ENV['WORKER1_IP'] || "192.168.100.3"
WORKER2_IP = ENV['WORKER2_IP'] || "192.168.100.4"

# --------------------------------------------------------------------------
# NETWORK HELPER
# --------------------------------------------------------------------------
def configure_network(vm, mode, ip=nil)
  if mode == "public"
    vm.network "public_network", type: "dhcp"
  else
    vm.network "private_network", ip: ip
  end
end

# --------------------------------------------------------------------------
# FIX DNS
# --------------------------------------------------------------------------
FIX_DNS = <<~'SHELL'
  echo "[SIMCOMP] Configurando DNS..."
  systemctl disable systemd-resolved --now 2>/dev/null || true
  rm -f /etc/resolv.conf
  echo "nameserver 8.8.8.8" > /etc/resolv.conf
  echo "nameserver 8.8.4.4" >> /etc/resolv.conf
SHELL

# --------------------------------------------------------------------------
# DOCKER INSTALL
# --------------------------------------------------------------------------
DOCKER_INSTALL = <<~'SHELL'
  set -e
  export DEBIAN_FRONTEND=noninteractive

  apt-get update -y
  apt-get install -y ca-certificates curl gnupg lsb-release apt-transport-https

  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc

  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  > /etc/apt/sources.list.d/docker.list

  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

  usermod -aG docker vagrant
  systemctl enable docker
  systemctl start docker
SHELL

# --------------------------------------------------------------------------
# MANAGER INIT (AUTO IP + TOKEN SERVER)
# --------------------------------------------------------------------------
MANAGER_INIT = <<~'SHELL'
  echo "[SIMCOMP] Inicializando Manager..."

  # En private_network libvirt asigna la IP privada como segunda interfaz
  # hostname -I retorna primero la NAT (192.168.121.x) — usamos la 192.168.100.x
  IP=$(hostname -I | tr ' ' '\n' | grep '^192\.168\.100\.' | head -1)
  if [ -z "$IP" ]; then
    IP=$(hostname -I | awk '{print $1}')
  fi
  echo "[SIMCOMP] Advertise IP: $IP"

  if ! docker info | grep -q "Swarm: active"; then
    docker swarm init --advertise-addr $IP
  fi

  TOKEN=$(docker swarm join-token -q worker)

  apt-get install -y python3 -y
  mkdir -p /opt/simcomp
  echo "$TOKEN" > /opt/simcomp/token

  pkill -f 'python3 -m http.server' 2>/dev/null || true
  cd /opt/simcomp
  nohup python3 -m http.server 8000 > /dev/null 2>&1 &
  echo "[SIMCOMP] Token server escuchando en $IP:8000"
SHELL

# --------------------------------------------------------------------------
# WORKER JOIN (LIBVIRT-SAFE)
# --------------------------------------------------------------------------
WORKER_JOIN = <<~'SHELL'
  echo "[SIMCOMP] Detectando manager..."

  # Intentar resolución por hostname; si falla, usar IP estática conocida
  MANAGER_IP=$(getent hosts managerDocker 2>/dev/null | awk '{print $1}')

  if [ -z "$MANAGER_IP" ]; then
    MANAGER_IP="192.168.100.2"
    echo "[SIMCOMP] Fallback a IP estática: $MANAGER_IP"
  else
    echo "[SIMCOMP] Manager encontrado en: $MANAGER_IP"
  fi

  # Esperar token HTTP del manager
  TIMEOUT=120
  ELAPSED=0

  while true; do
    TOKEN=$(curl -sf http://$MANAGER_IP:8000/token 2>/dev/null)

    if [ -n "$TOKEN" ]; then
      echo "[SIMCOMP] Token recibido"
      break
    fi

    echo "  -> Esperando token del manager..."
    sleep 5
    ELAPSED=$((ELAPSED+5))

    if [ $ELAPSED -ge $TIMEOUT ]; then
      echo "[ERROR] Timeout esperando token del manager"
      exit 1
    fi
  done

  if ! docker info | grep -q "Swarm: active"; then
    docker swarm join --token $TOKEN $MANAGER_IP:2377
  else
    echo "[SIMCOMP] Ya está en el swarm"
  fi
SHELL

# --------------------------------------------------------------------------
# DEPLOY
# --------------------------------------------------------------------------
MANAGER_DEPLOY = <<~'SHELL'
  echo "[SIMCOMP] Esperando nodos..."
  until [ $(docker node ls 2>/dev/null | grep -c "Ready") -ge 3 ]; do
    sleep 5
  done

  echo "[SIMCOMP] Limpiando stack previo..."
  docker stack rm simcomp 2>/dev/null || true
  
  echo "[SIMCOMP] Esperando remoción total de redes..."
  for i in {1..12}; do
    if ! docker network ls | grep -q "simcomp_"; then
      break
    fi
    echo "  -> todavía hay redes activas, esperando 5s..."
    sleep 5
  done

  docker volume prune -f
  docker system prune -f --volumes 2>/dev/null || true

  cd /vagrant/provisioning_docker
  echo "[SIMCOMP] Ejecutando deploy..."
  docker stack deploy -c stack.yml simcomp

  echo "[SIMCOMP] Deploy completado"
SHELL

# --------------------------------------------------------------------------
# MANAGER
# --------------------------------------------------------------------------
config.vm.define "managerDocker", primary: true do |m|
  m.vm.hostname = "managerDocker"

  configure_network(m.vm, NETWORK_MODE, MANAGER_IP)

  m.vm.provider "virtualbox" do |vb|
    vb.memory = 3072
    vb.cpus   = 2
  end

  m.vm.provider "libvirt" do |lv|
    lv.memory = 3072
    lv.cpus   = 2
  end

  m.vm.provision "shell", name: "fix-dns",       inline: FIX_DNS
  m.vm.provision "shell", name: "docker-install", inline: DOCKER_INSTALL
  m.vm.provision "shell", name: "swarm-init",    inline: MANAGER_INIT
  m.vm.provision "shell", name: "deploy-stack",   inline: MANAGER_DEPLOY, run: "never"
end

# --------------------------------------------------------------------------
# WORKERS
# --------------------------------------------------------------------------
[
  ["workerDocker1", WORKER1_IP],
  ["workerDocker2", WORKER2_IP]
].each do |name, ip|

  config.vm.define name do |w|
    w.vm.hostname = name

    configure_network(w.vm, NETWORK_MODE, ip)

    w.vm.provider "virtualbox" do |vb|
      vb.memory = 4096
      vb.cpus   = 2
    end

    w.vm.provider "libvirt" do |lv|
      lv.memory = 4096
      lv.cpus   = 2
    end

    w.vm.provision "shell", name: "fix-dns",       inline: FIX_DNS
    w.vm.provision "shell", name: "docker-install", inline: DOCKER_INSTALL
    w.vm.provision "shell", name: "worker-join",   inline: WORKER_JOIN
  end
end

end