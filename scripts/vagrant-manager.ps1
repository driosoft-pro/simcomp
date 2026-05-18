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

# Deep Clean Console function to avoid ghosting/overlapping text
function Clear-Screen {
    # Peque a pausa para asegurar que el buffer se vacie
    Start-Sleep -Milliseconds 50
    # Limpieza est ndar de PowerShell
    Clear-Host
    # Limpiar usando el metodo del sistema (mas fiable que Clear-Host)
    try { [System.Console]::Clear() } catch {}
    # C digos de escape ANSI (Fuerza limpieza en terminales modernos como VS Code/Windows Terminal)
    Write-Host -NoNewline "$([char]27)[2J$([char]27)[H"
}

# Robust Get-EnvVar function

# Robust Get-EnvVar function
# Robust Get-EnvVar function
function Get-EnvVar {
    param([string]$var, [string]$default = "")
    if (-not (Test-Path $ENV_FILE)) { return $default }
    $content = Get-Content $ENV_FILE
    foreach ($line in $content) {
        if ($line -match "^\s*$var\s*=\s*(.*)") {
            $val = $matches[1].Trim()
            if ($val -ne "") { return $val }
        }
    }
    return $default
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
    $subdomains = "www.$domain api.$domain stats.$domain monitor.$domain spark.$domain grafana.$domain prometheus.$domain glances.$domain"
    $newEntry = "$ip $domain $subdomains"
    
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    
    if (-not $isAdmin) {
        Log-Message "[!] Se requieren permisos para modificar hosts. Intentando elevar..." "Yellow"
        $tempFile = "$env:TEMP\hosts.tmp"
        try {
            # Preparamos el contenido en un archivo temporal
            $lines = Get-Content $hostsPath | Where-Object { $_.Trim() -notmatch "$domain" }
            $lines += $newEntry
            $lines | Set-Content $tempFile -Force
            
            # Copiamos el archivo temporal al destino usando CMD elevado y limpiamos cache DNS
            $process = Start-Process cmd -Verb RunAs -ArgumentList "/c copy /y `"$tempFile`" `"$hostsPath`" && ipconfig /flushdns" -PassThru -Wait
            if ($process.ExitCode -eq 0) {
                Log-Message "[OK] Archivo de hosts actualizado exitosamente." "Green"
            } else {
                Log-Message "[X] El usuario cancelo o hubo un error en la elevacion." "Red"
            }
        } catch {
            Log-Message "[X] Error al preparar la actualizacion de hosts." "Red"
        } finally {
            Remove-Item $tempFile -ErrorAction SilentlyContinue
        }
    } else {
        try {
            $content = Get-Content $hostsPath
            $filtered = $content | Where-Object { $_.Trim() -notmatch "\b$([regex]::Escape($domain))\b" }
            $filtered += $newEntry
            $filtered | Set-Content $hostsPath -Force
            Log-Message "[OK] /etc/hosts: $ip $domain (actualizado con subdominios)" "Green"
            # Flush DNS to ensure immediate effect
            ipconfig /flushdns | Out-Null
        } catch {
            Log-Message "[!] Error al modificar hosts: $($_.Exception.Message)" "Red"
        }
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

# High-performance port check (Replacement for Test-NetConnection)
function Test-Port {
    param([string]$ip, [int]$port, [int]$timeoutMs = 500)
    $tcp = New-Object System.Net.Sockets.TcpClient
    try {
        $connect = $tcp.BeginConnect($ip, $port, $null, $null)
        $wait = $connect.AsyncWaitHandle.WaitOne($timeoutMs, $false)
        if (-not $wait) { return $false }
        $tcp.EndConnect($connect)
        return $true
    } catch {
        return $false
    } finally {
        $tcp.Close()
        $tcp.Dispose()
    }
}

# Check for Hyper-V conflicts that slow down VirtualBox
function Test-HyperV {
    $conflict = $false
    # Check if VMMS service is running
    $hvService = Get-Service -Name "vmms" -ErrorAction SilentlyContinue
    if ($hvService -and $hvService.Status -eq "Running") { $conflict = $true }
    
    # Check if hypervisor is active (BCDEDIT)
    $bcd = bcdedit /enum | Select-String "hypervisorlaunchtype"
    if ($bcd -match "Auto") { $conflict = $true }

    return $conflict
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
    Clear-Screen
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
    Clear-Screen
    Log-Message "======================================" "Cyan"
    Log-Message "Seleccione entorno:" "Cyan"
    Log-Message "1) Native (VMs clasicas)" "Cyan"
    Log-Message "2) Docker Swarm" "Cyan"
    Log-Message "3) Swarm + Spark" "Cyan"
    Log-Message "q) Cancelar" "Cyan"
    Log-Message "======================================" "Cyan"

    $envOpt = Read-Host "Opcion"

    switch ($envOpt) {
        "1" { Copy-Item "vagrantfiles/Vagrantfile_native" "Vagrantfile" -Force }
        "2" { Copy-Item "vagrantfiles/Vagrantfile_docker_swarm" "Vagrantfile" -Force }
        "3" { 
                        Clear-Screen
            Log-Message "======================================" "Cyan"
            Log-Message "Seleccione sistema operativo host:" "Cyan"
            Log-Message "1) Windows" "Cyan"
            Log-Message "2) Linux" "Cyan"
            Log-Message "q) Cancelar" "Cyan"
            Log-Message "======================================" "Cyan"

            $osOpt = Read-Host "Opcion"

            switch ($osOpt) {

                # Windows
                "1" {
                    Copy-Item `
                        "vagrantfiles/Vagrantfile_docker_swarm_spark_windows" `
                        "Vagrantfile" `
                        -Force

                    Log-Message "[OK] Entorno Spark para Windows seleccionado." "Green"
                }

                # Linux
                "2" {
                    Copy-Item `
                        "vagrantfiles/Vagrantfile_docker_swarm_spark_linux" `
                        "Vagrantfile" `
                        -Force

                    Log-Message "[OK] Entorno Spark para Linux seleccionado." "Green"
                }

        "q" { return $false }
        Default { return $false }
    }
    }
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
    $managerIp = Get-EnvVar "MANAGER_IP" "192.168.100.2"

    # Fast check for port 80 (Web)
    if (Test-Port -ip $managerIp -port 80) {
        Write-Host "`n====================================================" -ForegroundColor Cyan
        Write-Host "         SERVICIOS Y ENLACES DEL CLUSTER" -ForegroundColor Cyan
        Write-Host "====================================================" -ForegroundColor Cyan
        
        Write-Host " [ACCESO PRINCIPAL]" -ForegroundColor Yellow
        Write-Host (" -> Web App:       http://{0} (o http://simcomp.co)" -f $managerIp) -ForegroundColor Green
        
        Write-Host "`n [INFRAESTRUCTURA Y MONITOREO]" -ForegroundColor Yellow
        Write-Host (" -> HAProxy Stats: http://{0}:8404/stats (o http://stats.simcomp.co:8404/stats)" -f $managerIp) -ForegroundColor Gray
        Write-Host (" -> Spark Master:  http://{0}:8010 (o http://spark.simcomp.co:8010)" -f $managerIp) -ForegroundColor Gray
        Write-Host (" -> Spark UI:      http://{0}:4040 (o http://simcomp.co:4040)" -f $managerIp) -ForegroundColor Gray
        Write-Host (" -> Prometheus:    http://{0}:9090 (o http://prometheus.simcomp.co:9090)" -f $managerIp) -ForegroundColor Gray
        Write-Host (" -> Grafana:       http://{0}:3000 (o http://grafana.simcomp.co:3000)" -f $managerIp) -ForegroundColor Gray
        Write-Host (" -> Glances (RT):  http://{0}:61208 (o http://glances.simcomp.co:61208)" -f $managerIp) -ForegroundColor Gray
        
        Write-Host "====================================================" -ForegroundColor Cyan
    }
}

function Optimize-Network {
    Clear-Screen
    Log-Message "======================================" "Cyan"
    Log-Message "   OPTIMIZACION DE RED (WINDOWS)" "Cyan"
    Log-Message "======================================" "Cyan"
    Log-Message "Para alcanzar los 2000 hilos sin errores en Windows," "White"
    Log-Message "es necesario ampliar el rango de puertos efimeros." "White"
    Log-Message "`n1. Abre una terminal (PowerShell o CMD) como ADMINISTRADOR." "Yellow"
    Log-Message "2. Ejecuta el siguiente comando:" "Yellow"
    Log-Message "`n   netsh int ipv4 set dynamicport tcp start=1025 num=64511" "Green"
    Log-Message "`nEsto evitara el error 'Connection Refused' bajo alta carga." "White"
    Log-Message "======================================" "Cyan"
}

function Run-JMeter {
    Clear-Screen
    Log-Message "======================================" "Cyan"
    Log-Message "   SIMCOMP - Pruebas JMeter (CLI)" "Cyan"
    Log-Message "======================================" "Cyan"
    Log-Message "1) Flujo Completo"
    Log-Message "2) Estres Frontend"
    Log-Message "3) Solo Login"
    Log-Message "4) Consulta Comparendos"
    Log-Message "5) Test Generico"
    Log-Message "q) Regresar"
    Log-Message "======================================" "Cyan"
    
    $jopt = Read-Host "Opcion"
    
    switch ($jopt) {
        "1" { $test = "jmeter/simcomp_workflow_completo.jmx"; $name = "flujo_completo" }
        "2" { $test = "jmeter/simcomp_estres-frontend.jmx"; $name = "estres_frontend" }
        "3" { $test = "jmeter/simcomp_login.jmx"; $name = "solo_login" }
        "4" { $test = "jmeter/simcomp_comparendos.jmx"; $name = "consulta_comparendos" }
        "5" { $test = "jmeter/simcomp_test.jmx"; $name = "test_generico" }
        "q" { return }
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
    
    Log-Message "[*] Optimizando JVM para alta carga..." "Gray"
    $env:JVM_ARGS = "-Xms2g -Xmx4g -XX:+UseG1GC -XX:MaxGCPauseMillis=100 -XX:G1ReservePercent=20"

    Log-Message "[*] Tip: Si tienes errores con muchos hilos (500+), ejecuta en una terminal ADMIN:" "Yellow"
    Log-Message "    netsh int ipv4 set dynamicport tcp start=1025 num=64511" "White"

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
        Write-Host "  q) Finalizar creacion de maquinas"
        
        $vmOpt = Read-Host "Opcion"
        
        if ($vmOpt -eq "q") {
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

    $managerIp = Get-EnvVar "MANAGER_IP" "192.168.100.2"
    
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

    $managerIp = Get-EnvVar "MANAGER_IP" "192.168.100.2"
    Inject-Hosts $managerIp "simcomp.co"

    Log-Message "[OK] CLUSTER LISTO" "Green"
    Show-Links
}

# Main Menu
while ($true) {
    Clear-Screen
    Log-Message "======================================" "Blue"
    Log-Message "   SIMCOMP INFRA MANAGER - WINDOWS" "Blue"
    Log-Message "======================================" "Blue"

    # Hyper-V Warning
    if (Test-HyperV) {
        Log-Message "[!] ALERTA DE RENDIMIENTO: Hyper-V detectado." "Yellow"
        Log-Message "    VirtualBox sera EXTREMADAMENTE lento (20+ min de arranque)." "Yellow"
        Log-Message "    Para corregir: bcdedit /set hypervisorlaunchtype off" "White"
        Log-Message "    y reinicia tu PC." "White"
        Log-Message "--------------------------------------" "Gray"
    }

    $managerIp = Get-EnvVar "MANAGER_IP" "192.168.100.2"

    # Fast connection check (SSH or HTTP)
    $isOnline = (Test-Port -ip $managerIp -port 22) -or (Test-Port -ip $managerIp -port 80)

    if ($isOnline) {
        Log-Message "Estado: Online ($managerIp)" "Green"
        
        # Check if domain resolves to correct IP
        try {
            $dnsCheck = [System.Net.Dns]::GetHostAddresses("simcomp.co") | Select-Object -ExpandProperty IPAddressToString
            if ($dnsCheck -ne $managerIp) {
                Log-Message "[!] DNS DESINCRONIZADO: simcomp.co apunta a $dnsCheck (debe ser $managerIp)" "Yellow"
                Log-Message "    Usa la opcion [8] para reparar el archivo de hosts." "Yellow"
            }
        } catch {
            Log-Message "[!] DNS SIN CONFIGURAR: simcomp.co no resuelve localmente." "Yellow"
            Log-Message "    Usa la opcion [8] para configurar el acceso por dominio." "Yellow"
        }

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
    Log-Message "8) Configurar DNS (Hosts)"
    Log-Message "9) Optimizar Red (Cuello de botella)"
    Log-Message "10) Limpiar TODO"
    Log-Message "q) Salir"
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
        "8" { Inject-Hosts (Get-EnvVar "MANAGER_IP" "192.168.100.2") "simcomp.co" }
        "9" { Optimize-Network }
        "10" { Cleanup-All }
        "q" { exit }
        Default { Log-Message "[!] Opcion invalida" "Red" }
    }

    Write-Host "`n[Presiona ENTER para volver al menu...]" -ForegroundColor Gray
    $null = Read-Host
}