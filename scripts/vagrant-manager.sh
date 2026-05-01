#!/bin/bash

cd "$(dirname "$0")/.." || exit 1

ENV_FILE=".env"
TOKEN_FILE="provisioning_docker/.swarm-token"
MANAGER_IP_FILE="provisioning_docker/.swarm-manager-ip"
LOG_FILE="simcomp.log"
MAX_RETRIES=3

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "$1"
    echo "$(date '+%F %T') - $1" >> "$LOG_FILE"
}

# Detectar doas (Arch) o sudo
if command -v doas &>/dev/null; then
    PRIV="doas"
else
    PRIV="sudo"
fi

# Inyectar entrada en /etc/hosts del HOST (idempotente, sin duplicados)
inject_hosts() {
    local ip="$1"
    local domain="$2"
    # Eliminar todas las líneas que contengan el dominio
    $PRIV bash -c "grep -v '\b${domain}\b' /etc/hosts > /tmp/_hosts_clean && cp /tmp/_hosts_clean /etc/hosts"
    # Agregar la entrada limpia
    echo "$ip $domain www.$domain api.$domain" | $PRIV tee -a /etc/hosts > /dev/null
    log "${GREEN}[✔] /etc/hosts: $ip $domain (limpio)${NC}"
}

# =============================
# ENV DINAMICO
# =============================
set_env_var() {
    VAR=$1
    VALUE=$2

    if grep -q "^$VAR=" "$ENV_FILE"; then
        sed -i "s|^$VAR=.*|$VAR=$VALUE|" "$ENV_FILE"
    else
        echo "$VAR=$VALUE" >> "$ENV_FILE"
    fi
}

detect_host_ip() {
    ip route get 8.8.8.8 | awk '{print $7; exit}'
}

# =============================
# NUEVO: CONFIG RED
# =============================
select_network_mode() {
    clear
    echo "======================================"
    echo "Seleccione modo de red:"
    echo "1) Private Network (Lab local)"
    echo "2) Public Network (Multi-PC real)"
    echo "======================================"

    read -p "Opción: " net

    case $net in
        1)
            NET_MODE="private"
            MANAGER_IP="192.168.100.2"
            ;;
        2)
            NET_MODE="public"
            MANAGER_IP=$(detect_host_ip)
            ;;
        *)
            log "${RED}Opción inválida${NC}"
            return 1
            ;;
    esac

    set_env_var NET_MODE "$NET_MODE"
    set_env_var MANAGER_IP "$MANAGER_IP"

    log "${GREEN}[✔] Red configurada: $NET_MODE${NC}"
    log "${GREEN}[✔] Manager IP: $MANAGER_IP${NC}"
}

# =============================
# SELECCION DE ENTORNO (TUYA)
# =============================
select_environment() {
    clear
    echo "======================================"
    echo "Seleccione entorno:"
    echo "1) 🖥 Native (VMs clásicas)"
    echo "2) 🐳 Docker Swarm"
    echo "3) ⚡ Swarm + Spark"
    echo "4) Cancelar"
    echo "======================================"

    read -p "Opción: " env

    case $env in
        1) cp vagrantfiles/Vagrantfile_native Vagrantfile ;;
        2) cp vagrantfiles/Vagrantfile_docker_swarm Vagrantfile ;;
        3) cp vagrantfiles/Vagrantfile_docker_swarm_spark Vagrantfile ;;
        *) return 1 ;;
    esac

    log "${GREEN}[✔] Entorno configurado${NC}"
}

# =============================
# LIMPIEZA
# =============================
cleanup_processes() {
    log "${YELLOW}[*] Buscando procesos Vagrant colgados...${NC}"

    ps aux | grep -E "vagrant|ruby.*vagrant" | grep -v grep

    pkill -f "ruby.*vagrant provision" 2>/dev/null || true
    pkill -f "ruby.*vagrant up" 2>/dev/null || true

    log "${GREEN}[✔] Limpieza segura completada.${NC}"
}

cleanup_all() {
    cleanup_processes

    log "${YELLOW}[*] Eliminando entorno...${NC}"
    vagrant destroy -f 2>/dev/null || true
    rm -rf .vagrant/
    sudo rm -rf .vagrant/ 2>/dev/null

    rm -f "$TOKEN_FILE" "$MANAGER_IP_FILE"
}

# =============================
# ESPERAS
# =============================
wait_for_docker() {
    VM=$1
    log "${YELLOW}[*] Esperando Docker en $VM...${NC}"
    for i in $(seq 1 20); do
        if vagrant ssh "$VM" -- docker info > /dev/null 2>&1; then
            log "${GREEN}[✔] Docker listo en $VM${NC}"
            return 0
        fi
        echo "  -> intento $i/20..."
        sleep 5
    done
    return 1
}

wait_for_nodes() {
    for i in {1..30}; do
        READY=$(vagrant ssh managerDocker -c "docker node ls --format '{{.Status}}'" 2>/dev/null | grep -c Ready)
        [ "$READY" -ge 3 ] && return 0
        sleep 5
    done
    return 1
}

show_links() {
    if vagrant status managerDocker 2>/dev/null | grep -q "running"; then
        MANAGER_IP=$(grep MANAGER_IP .env 2>/dev/null | cut -d '=' -f2 || echo "192.168.100.2")
        echo -e "${GREEN}    App:               http://$MANAGER_IP (o http://simcomp.co)${NC}"
        echo -e "${GREEN}    Stats:             http://stats.$MANAGER_IP:8404/stats${NC}"
        echo -e "${GREEN}    Spark Dashboard:   http://spark.$MANAGER_IP:8010${NC}"
        echo -e "${GREEN}    Spark UI:          http://spark.$MANAGER_IP:4040${NC}"
        echo -e "${GREEN}    Prometheus:        http://monitor.$MANAGER_IP:9090${NC}"
        echo -e "${GREEN}    Grafana:           http://monitor.$MANAGER_IP:3000${NC}"
        echo -e "${GREEN}    Glances RT:        http://monitor.$MANAGER_IP:61208${NC}"
    fi
}

# =============================
# NUEVO: MULTI HOST
# =============================
join_remote_worker() {
    read -p "IP nodo remoto: " REMOTE_IP
    read -p "Usuario SSH: " USER

    TOKEN=$(vagrant ssh managerDocker -c "docker swarm join-token -q worker" | tr -d '\r')

    ssh $USER@$REMOTE_IP "
        docker swarm join --token $TOKEN $(grep MANAGER_IP .env | cut -d '=' -f2):2377
    "
}

# =============================
# NUEVO: AUTO DISCOVERY
# =============================
auto_discovery() {
    BASE_IP=$(grep MANAGER_IP .env | cut -d '=' -f2 | cut -d. -f1-3)

    log "${BLUE}[*] Escaneando red...${NC}"

    for i in {2..254}; do
        IP="$BASE_IP.$i"
        ping -c1 -W1 $IP &>/dev/null && echo "Nodo activo: $IP"
    done
}

# =============================
# MODO EDUCATIVO (PASO A PASO)
# =============================
guided_mode() {

    select_environment || return
    select_network_mode || return

    read -p "Paso 1: Limpiar entorno → ENTER para continuar"
    cleanup_all

    read -p "Paso 2: Levantar VMs sin provisión → ENTER para continuar"
    vagrant up workerDocker1 --no-provision
    vagrant up workerDocker2 --no-provision
    vagrant up managerDocker --no-provision

    read -p "Paso 3: Instalar Docker e inicializar Swarm en manager → ENTER"
    vagrant provision managerDocker --provision-with fix-dns,docker-install,swarm-init

    read -p "Paso 4: Unir workers al Swarm → ENTER"
    vagrant provision workerDocker1
    vagrant provision workerDocker2

    read -p "Paso 5: Desplegar Stack → ENTER"
    vagrant provision managerDocker --provision-with deploy-stack

    log "${GREEN}[✔] PROCESO COMPLETADO${NC}"
    log "${GREEN}    App:               http://$MANAGER_IP (o http://simcomp.co)${NC}"
    log "${GREEN}    Stats:             http://stats.$MANAGER_IP:8404/stats${NC}"
    log "${GREEN}    Spark Dashboard:   http://spark.$MANAGER_IP:8010${NC}"
    log "${GREEN}    Spark UI:          http://spark.$MANAGER_IP:4040${NC}"
    log "${GREEN}    Prometheus:        http://monitor.$MANAGER_IP:9090${NC}"
    log "${GREEN}    Grafana:           http://monitor.$MANAGER_IP:3000${NC}"
    log "${GREEN}    Glances RT:        http://monitor.$MANAGER_IP:61208${NC}"
}

# =============================
# DEPLOY AUTOMATICO (MEJORADO)
# =============================
deploy_swarm() {

    log "${BLUE}========== DEPLOY AUTOMATICO ==========${NC}"

    select_environment || return
    select_network_mode || return

    cleanup_all

    log "${YELLOW}[*] Levantando VMs sin provisión...${NC}"
    vagrant up workerDocker1 --no-provision
    vagrant up workerDocker2 --no-provision
    vagrant up managerDocker --no-provision

    log "${YELLOW}[*] Provisionando manager (Docker + Swarm)...${NC}"
    vagrant provision managerDocker --provision-with fix-dns,docker-install,swarm-init

    log "${YELLOW}[*] Provisionando workers...${NC}"
    vagrant provision workerDocker1
    vagrant provision workerDocker2

    log "${YELLOW}[*] Esperando que el cluster esté completo...${NC}"
    wait_for_nodes || { log "${RED}[!] Cluster no listo tras espera. Revisa 'vagrant status'.${NC}"; return 1; }

    log "${YELLOW}[*] Desplegando Stack...${NC}"
    vagrant provision managerDocker --provision-with deploy-stack

    MANAGER_IP=$(grep MANAGER_IP .env 2>/dev/null | cut -d '=' -f2 || echo "192.168.100.2")

    # --------------------------------------------------
    # Inyectar entrada /etc/hosts en el HOST para que
    # el browser resuelva simcomp.co → manager IP.
    # Necesario porque la imagen frontend tiene la URL
    # hardcodeada como variable de build de Vite.
    # --------------------------------------------------
    inject_hosts "$MANAGER_IP" "simcomp.co"
    inject_hosts "$MANAGER_IP" "simcomp.local"

    MANAGER_IP=$(grep MANAGER_IP .env 2>/dev/null | cut -d '=' -f2 || echo "192.168.100.2")
    log "${GREEN}[✔] CLUSTER LISTO Y MONITOREADO${NC}"
    log "${GREEN}    App:               http://$MANAGER_IP (o http://simcomp.co)${NC}"
    log "${GREEN}    Stats:             http://stats.$MANAGER_IP:8404/stats${NC}"
    log "${GREEN}    Spark Dashboard:   http://spark.$MANAGER_IP:8010${NC}"
    log "${GREEN}    Spark UI:          http://spark.$MANAGER_IP:4040${NC}"
    log "${GREEN}    Prometheus:        http://monitor.$MANAGER_IP:9090${NC}"
    log "${GREEN}    Grafana:           http://monitor.$MANAGER_IP:3000${NC}"
    log "${GREEN}    Glances RT:        http://monitor.$MANAGER_IP:61208${NC}"
}

# =============================
# MENU (MEJORADO)
# =============================
while true; do
    clear
    echo "======================================"
    echo -e "   ${BLUE}SIMCOMP INFRA MANAGER FINAL${NC}"
    echo "======================================"

    vagrant status 2>/dev/null || echo "No hay entorno"
    show_links

    echo "======================================"
    echo "1) Paso a paso"
    echo "2) Semi automático"
    echo "3) Automático completo"
    echo "4) Iniciar VMs"
    echo "5) Apagar VMs"
    echo "6) Deploy stack"
    echo "7) Limpiar TODO"
    echo "8) Auto-discovery red"
    echo "9) Unir nodo remoto"
    echo "10) Logs"
    echo "11) Salir"
    echo "======================================"

    read -p "Opción: " opt

    case $opt in
        1) guided_mode ;;
        2) select_environment && select_network_mode && cleanup_all && vagrant up && vagrant provision ;;
        3) deploy_swarm ;;
        4) vagrant up ;;
        5) vagrant halt ;;
        6) vagrant provision managerDocker --provision-with deploy-stack ;;
        7) cleanup_all ;;
        8) auto_discovery ;;
        9) join_remote_worker ;;
        10) tail -f simcomp.log ;;
        11) exit 0 ;;
    esac

    read -p "ENTER..."
done