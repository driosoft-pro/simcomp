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
    # Forma rápida de detectar si el sistema está arriba sin llamar a 'vagrant status' (que es lento)
    MANAGER_IP=$(grep MANAGER_IP .env 2>/dev/null | cut -d '=' -f2 || echo "192.168.100.2")
    
    # Intentar conexión rápida al puerto 80 (HAProxy)
    if timeout 0.5 bash -c "true < /dev/tcp/$MANAGER_IP/80" 2>/dev/null; then
        echo -e "${BLUE}--- [ ENLACES DISPONIBLES ] ---${NC}"
        echo -e "${GREEN}    App Principal:      http://$MANAGER_IP (o http://simcomp.co)${NC}"
        
        echo -e "${YELLOW}    [ Métricas e Infraestructura ]${NC}"
        echo -e "${CYAN}      Stats HAProxy:   http://$MANAGER_IP:8404/stats (o http://simcomp.co:8404/stats)${NC}"
        echo -e "${CYAN}      Spark Dashboard: http://$MANAGER_IP:8010 (o http://simcomp.co:8010)${NC}"
        echo -e "${CYAN}      Spark UI:        http://$MANAGER_IP:4040 (o http://simcomp.co:4040)${NC}"
        echo -e "${CYAN}      Prometheus:      http://$MANAGER_IP:9090 (o http://simcomp.co:9090)${NC}"
        echo -e "${CYAN}      Grafana:         http://$MANAGER_IP:3000 (o http://simcomp.co:3000)${NC}"
        echo -e "${CYAN}      Glances RT:      http://$MANAGER_IP:61208 (o http://simcomp.co:61208)${NC}"
        echo -e "${BLUE}-------------------------------${NC}"
    fi
}

run_jmeter() {
    clear
    echo "======================================"
    echo "   SIMCOMP - Pruebas JMeter (CLI)"
    echo "======================================"
    echo "1) Flujo Completo (Login -> Personas -> Vehiculos)"
    echo "2) Estrés Frontend (Carga Masiva)"
    echo "3) Solo Login"
    echo "4) Consulta Comparendos"
    echo "5) Test Genérico"
    echo "6) Regresar"
    echo "======================================"
    read -p "Opción: " jopt
    
    case $jopt in
        1) TEST="jmeter/simcomp_workflow_completo.jmx"; NAME="flujo_completo" ;;
        2) TEST="jmeter/simcomp_estres-frontend.jmx"; NAME="estres_frontend" ;;
        3) TEST="jmeter/simcomp_login.jmx"; NAME="solo_login" ;;
        4) TEST="jmeter/simcomp_comparendos.jmx"; NAME="consulta_comparendos" ;;
        5) TEST="jmeter/simcomp_test.jmx"; NAME="test_generico" ;;
        *) return ;;
    esac

    if ! command -v jmeter &>/dev/null; then
        log "${RED}[!] Error: 'jmeter' no está instalado en este equipo.${NC}"
        return 1
    fi

    REPORT_DIR="jmeter/reports/$NAME"
    RESULT_FILE="jmeter/results/${NAME}_$(date +%Y%m%d_%H%M%S).jtl"
    
    mkdir -p jmeter/results
    mkdir -p "jmeter/reports"
    rm -rf "$REPORT_DIR" # Limpiar el reporte específico si existía
    
    log "${YELLOW}[*] Iniciando prueba JMeter ($NAME)...${NC}"
    if jmeter -n -t "$TEST" -l "$RESULT_FILE" -e -o "$REPORT_DIR"; then
        log "${GREEN}[✔] Prueba finalizada correctamente.${NC}"
        
        # Generar o actualizar index.html general con estilo premium
        INDEX_FILE="jmeter/reports/index.html"
        cat <<EOF > "$INDEX_FILE"
<html>
<head>
    <title>SIMCOMP - Reportes de Pruebas</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: #0f0f13; color: #e0e0e0; padding: 40px; display: flex; flex-direction: column; align-items: center; }
        .container { max-width: 800px; width: 100%; background: #1a1a24; padding: 30px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.5); border: 1px solid #333; }
        h1 { color: #4caf50; text-align: center; margin-bottom: 30px; text-transform: uppercase; letter-spacing: 2px; }
        ul { list-style: none; padding: 0; }
        li { background: #252533; margin: 10px 0; border-radius: 8px; transition: transform 0.2s, background 0.2s; border: 1px solid transparent; }
        li:hover { transform: translateX(10px); background: #2d2d3d; border-color: #4caf50; }
        a { display: block; padding: 15px 20px; color: #fff; text-decoration: none; font-size: 1.1em; }
        .footer { margin-top: 30px; font-size: 0.9em; color: #888; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <h1>SIMCOMP Performance Hub</h1>
        <ul>
EOF
        for d in jmeter/reports/*/; do
            folder=$(basename "$d")
            displayName=$(echo "$folder" | tr '_' ' ' | sed 's/\b\(.\)/\u\1/g')
            echo "<li><a href='./$folder/index.html'>📊 Reporte: $displayName</a></li>" >> "$INDEX_FILE"
        done
        cat <<EOF >> "$INDEX_FILE"
        </ul>
        <div class="footer">
            Última actualización: $(date) | SIMCOMP Infrastructure
        </div>
    </div>
</body>
</html>
EOF

        log "${GREEN}[✔] Reporte generado en: $(pwd)/$REPORT_DIR/index.html${NC}"
        log "${GREEN}[✔] Menú de reportes actualizado: $(pwd)/$INDEX_FILE${NC}"
    else
        log "${RED}[!] Error: La prueba de JMeter falló o fue cancelada.${NC}"
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

    echo -e "${YELLOW}--- MODO GUIADO: PASO A PASO ---${NC}"
    
    # Paso 1: Limpiar
    read -p "Paso 1: Limpiar entorno previo → ENTER para continuar"
    cleanup_all

    # Paso 2: Crear VMs una a una
    echo -e "\n${YELLOW}Paso 2: Creación de máquinas virtuales (sin provisión)${NC}"
    vms_to_create=("managerDocker" "workerDocker1" "workerDocker2")
    created_vms=()
    
    while [ ${#created_vms[@]} -lt 3 ]; do
        echo -e "\nSeleccione la máquina a crear:"
        for i in "${!vms_to_create[@]}"; do
            echo "  $((i+1))) ${vms_to_create[$i]}"
        done
        echo "  4) Finalizar creación de máquinas (si ya creó las necesarias)"
        
        read -p "Opción: " vm_opt
        
        if [[ "$vm_opt" == "4" ]]; then
            break
        elif [[ "$vm_opt" =~ ^[1-3]$ ]]; then
            vm_index=$((vm_opt-1))
            vm_name=${vms_to_create[$vm_index]}
            
            log "${YELLOW}[*] Levantando $vm_name...${NC}"
            vagrant up "$vm_name" --no-provision
            
            # Mover de disponibles a creadas si no estaba ya
            if [[ ! " ${created_vms[@]} " =~ " ${vm_name} " ]]; then
                created_vms+=("$vm_name")
            fi
            log "${GREEN}[✔] $vm_name levantada.${NC}"
        else
            echo -e "${RED}Opción inválida.${NC}"
        fi
    done

    # Paso 3: Conectar entre sí (Docker Swarm)
    echo -e "\n${YELLOW}Paso 3: Conectar máquinas (Docker Swarm)${NC}"
    read -p "Presiona ENTER para inicializar el cluster y unir los nodos..."
    
    log "${YELLOW}[*] Inicializando Swarm en managerDocker...${NC}"
    vagrant provision managerDocker --provision-with fix-dns,docker-install,swarm-init
    
    log "${YELLOW}[*] Uniendo workers al cluster...${NC}"
    vagrant provision workerDocker1 --provision-with fix-dns,docker-install,worker-join
    vagrant provision workerDocker2 --provision-with fix-dns,docker-install,worker-join

    # Paso 4: Deploy
    echo -e "\n${YELLOW}Paso 4: Realizar el Deploy de la aplicación${NC}"
    read -p "Presiona ENTER para desplegar el stack de microservicios..."
    
    log "${YELLOW}[*] Desplegando Stack en managerDocker...${NC}"
    vagrant provision managerDocker --provision-with deploy-stack

    MANAGER_IP=$(grep MANAGER_IP .env 2>/dev/null | cut -d '=' -f2 || echo "192.168.100.2")
    inject_hosts "$MANAGER_IP" "simcomp.co"
    inject_hosts "$MANAGER_IP" "simcomp.local"

    log "${GREEN}[✔] PROCESO COMPLETADO EXITOSAMENTE${NC}"
    show_links
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
    log "${GREEN}    Stats HAProxy:     http://$MANAGER_IP:8404/stats (o http://simcomp.co:8404/stats)${NC}"
    log "${GREEN}    Spark Dashboard:   http://$MANAGER_IP:8010 (o http://simcomp.co:8010)${NC}"
    log "${GREEN}    Spark UI:          http://$MANAGER_IP:4040 (o http://simcomp.co:4040)${NC}"
    log "${GREEN}    Prometheus:        http://$MANAGER_IP:9090 (o http://simcomp.co:9090)${NC}"
    log "${GREEN}    Grafana:           http://$MANAGER_IP:3000 (o http://simcomp.co:3000)${NC}"
    log "${GREEN}    Glances RT:        http://$MANAGER_IP:61208 (o http://simcomp.co:61208)${NC}"
}

# =============================
# MENU (MEJORADO)
# =============================
while true; do
    clear
    echo "======================================"
    echo -e "   ${BLUE}SIMCOMP INFRA MANAGER FINAL${NC}"
    echo "======================================"

    # Solo mostramos el estado de las VMs si el usuario lo pide o de forma rápida
    # Para evitar lentitud, solo verificamos si el Manager responde al ping
    MANAGER_IP=$(grep MANAGER_IP .env 2>/dev/null | cut -d '=' -f2 || echo "192.168.100.2")
    if ping -c 1 -W 0.2 "$MANAGER_IP" &>/dev/null; then
        echo -e "Estado: ${GREEN}Online${NC}"
        show_links
    else
        echo -e "Estado: ${RED}Offline${NC} (Usa la opción 4 para iniciar)"
    fi

    echo "======================================"
    echo "1) Paso a paso"
    echo "2) Semi automático"
    echo "3) Automático completo"
    echo "4) Iniciar VMs"
    echo "5) Apagar VMs"
    echo "6) Deploy stack"
    echo "7) Pruebas JMeter (CLI)"
    echo "8) Limpiar TODO"
    echo "9) Auto-discovery red"
    echo "10) Unir nodo remoto"
    echo "11) Logs"
    echo "12) Salir"
    echo "======================================"

    read -p "Opción: " opt

    case $opt in
        1) guided_mode ;;
        2) select_environment && select_network_mode && cleanup_all && vagrant up && vagrant provision ;;
        3) deploy_swarm ;;
        4) vagrant up ;;
        5) vagrant halt ;;
        6) vagrant provision managerDocker --provision-with deploy-stack ;;
        7) run_jmeter ;;
        8) cleanup_all ;;
        9) auto_discovery ;;
        10) join_remote_worker ;;
        11) tail -f simcomp.log ;;
        12) exit 0 ;;
    esac

    read -p "ENTER..."
done