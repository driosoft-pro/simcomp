# SIMCOMP INFRA MANAGER - Windows Version (PowerShell)
# --------------------------------------------------

$ENV_FILE = ".env"
$TOKEN_FILE = "provisioning_docker/.swarm-token"
$MANAGER_IP_FILE = "provisioning_docker/.swarm-manager-ip"
$LOG_FILE = "simcomp.log"

# Function to log messages
function Log-Message {
    param([string]$message, [string]$color = "White")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "$message" -ForegroundColor $color
    Add-Content -Path $LOG_FILE -Value "$timestamp - $message"
}

# Check if vagrant is installed
if (-not (Get-Command vagrant -ErrorAction SilentlyContinue)) {
    Log-Message "[!] ERROR: No se encontro el comando 'vagrant' en tu sistema." "Red"
    Log-Message "    Asegurate de haberlo instalado usando la opcion [8] del menu principal." "Yellow"
    Log-Message "    Si ya lo instalaste, debes REINICIAR la terminal para que los cambios surtan efecto." "White"
    Read-Host "`nPresiona ENTER para salir"
    exit
}

# Inject entry in C:\Windows\System32\drivers\etc\hosts
function Inject-Hosts {
    param([string]$ip, [string]$domain)
    $hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
    $newEntry = "$ip $domain www.$domain api.$domain"
    
    try {
        if (-Not (Test-Path $hostsPath)) {
            Log-Message "[!] Archivo de hosts no encontrado." "Red"
            return
        }

        # Read content, filter out existing entries for the domain
        $content = Get-Content $hostsPath
        $filtered = $content | Where-Object { $_ -notmatch "\b$([regex]::Escape($domain))\b" }
        
        # Append new entry
        $filtered += $newEntry
        
        # Write back to file
        $filtered | Set-Content $hostsPath -ErrorAction Stop
        Log-Message "[OK] /etc/hosts: $ip $domain (limpio)" "Green"
    } catch {
        Log-Message "[!] Error modificando /etc/hosts. Ejecuta como ADMINISTRADOR." "Red"
    }
}

# Set environment variable in .env file
function Set-EnvVar {
    param([string]$var, [string]$value)
    if (-Not (Test-Path $ENV_FILE)) {
        New-Item -Path $ENV_FILE -ItemType File | Out-Null
    }
    
    $content = Get-Content $ENV_FILE
    $found = $false
    $newContent = @()
    
    foreach ($line in $content) {
        if ($line -match "^$var=") {
            $newContent += "$var=$value"
            $found = $true
        } else {
            $newContent += $line
        }
    }
    
    if (-not $found) {
        $newContent += "$var=$value"
    }
    
    $newContent | Set-Content $ENV_FILE
}

# Detect Host IP (Public)
function Detect-HostIP {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback|VirtualBox|VMware' } | Select-Object -First 1).IPAddress
    if (-not $ip) { $ip = "127.0.0.1" }
    return $ip
}

function Wait-For-Nodes {
    Log-Message "[*] Esperando a que los nodos esten listos..." "Yellow"
    for ($i = 1; $i -le 30; $i++) {
        $ready = (vagrant ssh managerDocker -c "docker node ls --format '{{.Status}}'" 2>$null | Select-String "Ready" | Measure-Object).Count
        if ($ready -ge 3) {
            Log-Message "[OK] Nodos listos" "Green"
            return $true
        }
        Log-Message "  -> intento $i/30..." "Gray"
        Start-Sleep -Seconds 5
    }
    return $false
}

# Network Configuration Mode
function Select-NetworkMode {
    Clear-Host
    Log-Message "======================================" "Cyan"
    Log-Message "Seleccione modo de red:" "Cyan"
    Log-Message "1) Private Network (Lab local)" "Cyan"
    Log-Message "2) Public Network (Multi-PC real)" "Cyan"
    Log-Message "======================================" "Cyan"

    $net = Read-Host "Opcion"
    
    switch ($net) {
        "1" {
            $script:NET_MODE = "private"
            $script:MANAGER_IP = "192.168.100.2"
        }
        "2" {
            $script:NET_MODE = "public"
            $script:MANAGER_IP = Detect-HostIP
        }
        Default {
            Log-Message "[!] Opcion invalida" "Red"
            return $false
        }
    }

    Set-EnvVar "NET_MODE" $NET_MODE
    Set-EnvVar "MANAGER_IP" $MANAGER_IP

    Log-Message "[OK] Red configurada: $NET_MODE" "Green"
    Log-Message "[OK] Manager IP: $MANAGER_IP" "Green"
    return $true
}

# Environment Selection
function Select-Environment {
    Clear-Host
    Log-Message "======================================" "Cyan"
    Log-Message "Seleccione entorno:" "Cyan"
    Log-Message "1) Native (VMs clasicas)" "Cyan"
    Log-Message "2) Docker Swarm" "Cyan"
    Log-Message "3) Swarm + Spark" "Cyan"
    Log-Message "4) Cancelar" "Cyan"
    Log-Message "======================================" "Cyan"

    $envOpt = Read-Host "Opcion"

    switch ($envOpt) {
        "1" { Copy-Item "vagrantfiles/Vagrantfile_native" "Vagrantfile" -Force }
        "2" { Copy-Item "vagrantfiles/Vagrantfile_docker_swarm" "Vagrantfile" -Force }
        "3" { Copy-Item "vagrantfiles/Vagrantfile_docker_swarm_spark" "Vagrantfile" -Force }
        Default { return $false }
    }

    Log-Message "[OK] Entorno configurado" "Green"
    return $true
}

# Cleanup
function Cleanup-Processes {
    Log-Message "[*] Buscando procesos Vagrant colgados..." "Yellow"
    Get-Process -Name "ruby" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*Vagrant*" } | Stop-Process -Force -ErrorAction SilentlyContinue
    Log-Message "[OK] Limpieza de procesos completada." "Green"
}

function Cleanup-All {
    Cleanup-Processes
    Log-Message "[*] Eliminando entorno..." "Yellow"
    vagrant destroy -f 2>$null
    if (Test-Path ".vagrant/") {
        Remove-Item -Path ".vagrant/" -Recurse -Force -ErrorAction SilentlyContinue
    }
    if (Test-Path $TOKEN_FILE) { Remove-Item $TOKEN_FILE }
    if (Test-Path $MANAGER_IP_FILE) { Remove-Item $MANAGER_IP_FILE }
    Log-Message "[OK] Limpieza total completada." "Green"
}

# Wait for Docker
function Wait-For-Docker {
    param([string]$vm)
    Log-Message "[*] Esperando Docker en $vm..." "Yellow"
    for ($i = 1; $i -le 20; $i++) {
        $check = vagrant ssh "$vm" -c "docker info" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Log-Message "[OK] Docker listo en $vm" "Green"
            return $true
        }
        Log-Message "  -> intento $i/20..." "Gray"
        Start-Sleep -Seconds 5
    }
    return $false
}

function Show-Links {
    $managerIp = "192.168.100.2"
    if (Test-Path $ENV_FILE) {
        $line = Get-Content $ENV_FILE | Select-String "MANAGER_IP="
        if ($line) { $managerIp = $line.ToString().Split("=")[1] }
    }

    $connection = Test-NetConnection -ComputerName $managerIp -Port 80 -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Log-Message "`n--- [ ENLACES DISPONIBLES ] ---" "Cyan"
        Log-Message "    App Principal:      http://$managerIp (o http://simcomp.co)" "Green"
        Log-Message "    [ Metricas e Infraestructura ]" "Yellow"
        Log-Message "      Stats HAProxy:   http://$managerIp:8404/stats" "Gray"
        Log-Message "      Spark Dashboard: http://$managerIp:8010" "Gray"
        Log-Message "      Prometheus:      http://$managerIp:9090" "Gray"
        Log-Message "      Grafana:         http://$managerIp:3000" "Gray"
        Log-Message "-------------------------------" "Cyan"
    }
}

function Run-JMeter {
    Clear-Host
    Log-Message "======================================" "Cyan"
    Log-Message "   SIMCOMP - Pruebas JMeter (CLI)" "Cyan"
    Log-Message "======================================" "Cyan"
    Log-Message "1) Flujo Completo"
    Log-Message "2) Estres Frontend"
    Log-Message "3) Solo Login"
    Log-Message "4) Consulta Comparendos"
    Log-Message "5) Test Generico"
    Log-Message "6) Regresar"
    Log-Message "======================================" "Cyan"
    
    $jopt = Read-Host "Opcion"
    
    switch ($jopt) {
        "1" { $test = "jmeter/simcomp_workflow_completo.jmx"; $name = "flujo_completo" }
        "2" { $test = "jmeter/simcomp_estres-frontend.jmx"; $name = "estres_frontend" }
        "3" { $test = "jmeter/simcomp_login.jmx"; $name = "solo_login" }
        "4" { $test = "jmeter/simcomp_comparendos.jmx"; $name = "consulta_comparendos" }
        "5" { $test = "jmeter/simcomp_test.jmx"; $name = "test_generico" }
        Default { return }
    }

    if (-not (Get-Command jmeter -ErrorAction SilentlyContinue)) {
        Log-Message "[!] Error: 'jmeter' no encontrado en el PATH." "Red"
        return
    }

    $reportDir = "jmeter/reports/$name"
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $resultFile = "jmeter/results/${name}_$timestamp.jtl"

    if (!(Test-Path "jmeter/results")) { New-Item -ItemType Directory -Path "jmeter/results" | Out-Null }
    if (!(Test-Path "jmeter/reports")) { New-Item -ItemType Directory -Path "jmeter/reports" | Out-Null }
    if (Test-Path "$reportDir") { Remove-Item -Path "$reportDir" -Recurse -Force }
    
    Log-Message "[*] Iniciando prueba JMeter ($name)..." "Yellow"
    jmeter -n -t "$test" -l "$resultFile" -e -o "$reportDir"
    
    if ($LASTEXITCODE -eq 0) {
        Log-Message "[OK] Prueba finalizada. Reporte en: $reportDir/index.html" "Green"
    } else {
        Log-Message "[!] Error: La prueba de JMeter fallo." "Red"
    }
}

# Guided Mode
function Guided-Mode {
    if (-not (Select-Environment)) { return }
    if (-not (Select-NetworkMode)) { return }

    Log-Message "`n--- MODO GUIADO: PASO A PASO ---" "Yellow"

    # Paso 1: Limpiar
    Write-Host "`nPaso 1: Limpiar entorno previo" -ForegroundColor Cyan
    Read-Host "Presiona [ENTER] para comenzar la limpieza..."
    Cleanup-All

    # Paso 2: Crear VMs
    Write-Host "`nPaso 2: Creacion de maquinas virtuales" -ForegroundColor Cyan
    $vmsToCreate = @("managerDocker", "workerDocker1", "workerDocker2")
    $createdVms = New-Object System.Collections.Generic.List[string]

    while ($createdVms.Count -lt 3) {
        Write-Host "`nSeleccione la maquina a crear:" -ForegroundColor White
        for ($i = 0; $i -lt $vmsToCreate.Count; $i++) {
            Write-Host "  $($i + 1)) $($vmsToCreate[$i])"
        }
        Write-Host "  4) Finalizar creacion de maquinas"
        
        $vmOpt = Read-Host "Opcion"
        
        if ($vmOpt -eq "4") {
            break
        } elseif ($vmOpt -match "^[1-3]$") {
            $vmIndex = [int]$vmOpt - 1
            $vmName = $vmsToCreate[$vmIndex]
            Log-Message "[*] Levantando $vmName..." "Yellow"
            vagrant up "$vmName" --no-provision
            if (-not $createdVms.Contains($vmName)) { $createdVms.Add($vmName) }
            Log-Message "[OK] $vmName levantada." "Green"
        }
    }

    # Paso 3: Swarm
    Write-Host "`nPaso 3: Conectar maquinas (Docker Swarm)" -ForegroundColor Cyan
    Read-Host "Presiona [ENTER] para configurar el cluster..."
    
    Log-Message "[*] Provisionando managerDocker..." "Yellow"
    vagrant provision managerDocker --provision-with fix-dns,docker-install,swarm-init
    
    Log-Message "[*] Provisionando workers..." "Yellow"
    vagrant provision workerDocker1 --provision-with fix-dns,docker-install,worker-join
    vagrant provision workerDocker2 --provision-with fix-dns,docker-install,worker-join

    # Paso 4: Deploy
    Write-Host "`nPaso 4: Realizar el Deploy de la aplicacion" -ForegroundColor Cyan
    Read-Host "Presiona [ENTER] para desplegar el stack..."
    
    Log-Message "[*] Desplegando Stack..." "Yellow"
    vagrant provision managerDocker --provision-with deploy-stack

    $managerIp = "192.168.100.2"
    if (Test-Path $ENV_FILE) {
        $line = Get-Content $ENV_FILE | Select-String "MANAGER_IP="
        if ($line) { $managerIp = $line.ToString().Split("=")[1] }
    }
    
    Inject-Hosts $managerIp "simcomp.co"
    Log-Message "[OK] PROCESO COMPLETADO EXITOSAMENTE" "Green"
    Show-Links
}

# Deploy Swarm (Automatic)
function Deploy-Swarm {
    Log-Message "========== DEPLOY AUTOMATICO ==========" "Blue"
    if (-not (Select-Environment)) { return }
    if (-not (Select-NetworkMode)) { return }

    Cleanup-All

    Log-Message "[*] Levantando VMs..." "Yellow"
    vagrant up --no-provision

    Log-Message "[*] Configurando Cluster..." "Yellow"
    vagrant provision managerDocker --provision-with fix-dns,docker-install,swarm-init
    vagrant provision workerDocker1 --provision-with fix-dns,docker-install,worker-join
    vagrant provision workerDocker2 --provision-with fix-dns,docker-install,worker-join

    if (-not (Wait-For-Nodes)) {
        Log-Message "[!] Cluster no listo." "Red"
        return
    }

    Log-Message "[*] Desplegando Stack..." "Yellow"
    vagrant provision managerDocker --provision-with deploy-stack

    $managerIp = "192.168.100.2"
    if (Test-Path $ENV_FILE) {
        $line = Get-Content $ENV_FILE | Select-String "MANAGER_IP="
        if ($line) { $managerIp = $line.ToString().Split("=")[1] }
    }
    Inject-Hosts $managerIp "simcomp.co"

    Log-Message "[OK] CLUSTER LISTO" "Green"
    Show-Links
}

# Main Menu
while ($true) {
    Clear-Host
    Log-Message "======================================" "Blue"
    Log-Message "   SIMCOMP INFRA MANAGER - WINDOWS" "Blue"
    Log-Message "======================================" "Blue"

    $managerIp = "192.168.100.2"
    if (Test-Path $ENV_FILE) {
        $line = Get-Content $ENV_FILE | Select-String "MANAGER_IP="
        if ($line) { $managerIp = $line.ToString().Split("=")[1] }
    }

    if (Test-Connection -ComputerName $managerIp -Count 1 -Quiet -ErrorAction SilentlyContinue) {
        Log-Message "Estado: Online ($managerIp)" "Green"
        Show-Links
    } else {
        Log-Message "Estado: Offline" "Red"
    }

    Log-Message "`n1) Paso a paso (Guiado)"
    Log-Message "2) Semi automatico"
    Log-Message "3) Automatico completo"
    Log-Message "4) Iniciar VMs"
    Log-Message "5) Apagar VMs"
    Log-Message "6) Deploy stack"
    Log-Message "7) Pruebas JMeter (CLI)"
    Log-Message "8) Limpiar TODO"
    Log-Message "9) Salir"
    Log-Message "======================================" "White"

    $opt = Read-Host "Opcion"

    switch ($opt) {
        "1" { Guided-Mode }
        "2" { 
            if (Select-Environment) { 
                if (Select-NetworkMode) { 
                    Cleanup-All; vagrant up; vagrant provision 
                } 
            } 
        }
        "3" { Deploy-Swarm }
        "4" { vagrant up }
        "5" { vagrant halt }
        "6" { vagrant provision managerDocker --provision-with deploy-stack }
        "7" { Run-JMeter }
        "8" { Cleanup-All }
        "9" { exit }
        Default { Log-Message "[!] Opcion invalida" "Red" }
    }

    Read-Host "`nENTER para continuar..."
}