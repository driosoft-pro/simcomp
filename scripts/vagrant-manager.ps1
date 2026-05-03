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
        Log-Message "[✔] /etc/hosts: $ip $domain (limpio)" "Green"
    } catch {
        Log-Message "[!] Error modificando /etc/hosts. Asegúrate de ejecutar PowerShell como ADMINISTRADOR." "Red"
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
            Log-Message "[✔] Nodos listos" "Green"
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

    $net = Read-Host "Opción"
    
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
            Log-Message "[!] Opción inválida" "Red"
            return $false
        }
    }

    Set-EnvVar "NET_MODE" $NET_MODE
    Set-EnvVar "MANAGER_IP" $MANAGER_IP

    Log-Message "[✔] Red configurada: $NET_MODE" "Green"
    Log-Message "[✔] Manager IP: $MANAGER_IP" "Green"
    return $true
}

# Environment Selection
function Select-Environment {
    Clear-Host
    Log-Message "======================================" "Cyan"
    Log-Message "Seleccione entorno:" "Cyan"
    Log-Message "1) 🖥 Native (VMs clásicas)" "Cyan"
    Log-Message "2) 🐳 Docker Swarm" "Cyan"
    Log-Message "3) ⚡ Swarm + Spark" "Cyan"
    Log-Message "4) Cancelar" "Cyan"
    Log-Message "======================================" "Cyan"

    $envOpt = Read-Host "Opción"

    switch ($envOpt) {
        "1" { Copy-Item "vagrantfiles/Vagrantfile_native" "Vagrantfile" -Force }
        "2" { Copy-Item "vagrantfiles/Vagrantfile_docker_swarm" "Vagrantfile" -Force }
        "3" { Copy-Item "vagrantfiles/Vagrantfile_docker_swarm_spark" "Vagrantfile" -Force }
        Default { return $false }
    }

    Log-Message "[✔] Entorno configurado" "Green"
    return $true
}

# Cleanup
function Cleanup-Processes {
    Log-Message "[*] Buscando procesos Vagrant colgados..." "Yellow"
    
    # In Windows, we usually look for ruby.exe running vagrant
    Get-Process -Name "ruby" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "vagrant" } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Log-Message "[✔] Limpieza de procesos completada." "Green"
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
    
    Log-Message "[✔] Limpieza total completada." "Green"
}

# Wait for Docker
function Wait-For-Docker {
    param([string]$vm)
    Log-Message "[*] Esperando Docker en $vm..." "Yellow"
    for ($i = 1; $i -le 20; $i++) {
        $check = vagrant ssh "$vm" -c "docker info" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Log-Message "[✔] Docker listo en $vm" "Green"
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

    # Forma rápida de detectar si el puerto 80 está abierto (HAProxy)
    $connection = Test-NetConnection -ComputerName $managerIp -Port 80 -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Log-Message "--- [ ENLACES DISPONIBLES ] ---" "Blue"
        Log-Message "    App Principal:      http://$managerIp (o http://simcomp.co)" "Green"
        
        Log-Message "    [ Métricas e Infraestructura ]" "Yellow"
        Log-Message "      Stats HAProxy:   http://$managerIp:8404/stats (o http://simcomp.co:8404/stats)" "Cyan"
        Log-Message "      Spark Dashboard: http://$managerIp:8010 (o http://simcomp.co:8010)" "Cyan"
        Log-Message "      Spark UI:        http://$managerIp:4040 (o http://simcomp.co:4040)" "Cyan"
        Log-Message "      Prometheus:      http://$managerIp:9090 (o http://simcomp.co:9090)" "Cyan"
        Log-Message "      Grafana:         http://$managerIp:3000 (o http://simcomp.co:3000)" "Cyan"
        Log-Message "      Glances RT:      http://$managerIp:61208 (o http://simcomp.co:61208)" "Cyan"
        Log-Message "-------------------------------" "Blue"
    }
}

function Run-JMeter {
    Clear-Host
    Log-Message "======================================" "Cyan"
    Log-Message "   SIMCOMP - Pruebas JMeter (CLI)" "Cyan"
    Log-Message "======================================" "Cyan"
    Log-Message "1) Flujo Completo (Login -> Personas -> Vehiculos)"
    Log-Message "2) Estrés Frontend (Carga Masiva)"
    Log-Message "3) Solo Login"
    Log-Message "4) Consulta Comparendos"
    Log-Message "5) Test Genérico"
    Log-Message "6) Regresar"
    Log-Message "======================================" "Cyan"
    
    $jopt = Read-Host "Opción"
    
    switch ($jopt) {
        "1" { $test = "jmeter/simcomp_workflow_completo.jmx"; $name = "flujo_completo" }
        "2" { $test = "jmeter/simcomp_estres-frontend.jmx"; $name = "estres_frontend" }
        "3" { $test = "jmeter/simcomp_login.jmx"; $name = "solo_login" }
        "4" { $test = "jmeter/simcomp_comparendos.jmx"; $name = "consulta_comparendos" }
        "5" { $test = "jmeter/simcomp_test.jmx"; $name = "test_generico" }
        Default { return }
    }

    $jmeterCmd = "jmeter"
    if (-not (Get-Command $jmeterCmd -ErrorAction SilentlyContinue)) {
        Log-Message "[!] Error: 'jmeter' no se encuentra en las variables de entorno (PATH)." "Red"
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
        Log-Message "[✔] Prueba finalizada correctamente." "Green"
        
        # Generar o actualizar index.html general con estilo premium
        $indexFile = "jmeter/reports/index.html"
        $htmlContent = @"
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
"@
        $folders = Get-ChildItem "jmeter/reports" -Directory
        foreach ($f in $folders) {
            $folderName = $f.Name
            $displayName = (Get-Culture).TextInfo.ToTitleCase($folderName.Replace("_", " "))
            $htmlContent += "<li><a href='./$folderName/index.html'>📊 Reporte: $displayName</a></li>`n"
        }
        
        $date = Get-Date
        $htmlContent += @"
        </ul>
        <div class="footer">
            Última actualización: $date | SIMCOMP Infrastructure
        </div>
    </div>
</body>
</html>
"@
        $htmlContent | Set-Content $indexFile

        Log-Message "[✔] Reporte generado en: $reportDir/index.html" "Green"
        Log-Message "[✔] Menú de reportes actualizado: $indexFile" "Green"
    } else {
        Log-Message "[!] Error: La prueba de JMeter falló o fue cancelada." "Red"
    }
}

# Join Remote Worker
function Join-RemoteWorker {
    $remoteIp = Read-Host "IP nodo remoto"
    $user = Read-Host "Usuario SSH"

    $token = (vagrant ssh managerDocker -c "docker swarm join-token -q worker" 2>$null).Trim()
    $managerIp = (Get-Content $ENV_FILE | Select-String "MANAGER_IP=").ToString().Split("=")[1]

    Log-Message "[*] Uniendo nodo remoto $remoteIp..." "Yellow"
    # Note: Requires SSH client installed on Windows
    ssh "$user@$remoteIp" "docker swarm join --token $token $managerIp:2377"
}

# Auto Discovery
function Auto-Discovery {
    $baseIpLine = Get-Content $ENV_FILE | Select-String "MANAGER_IP="
    if (-not $baseIpLine) {
        Log-Message "[!] No se encontró MANAGER_IP en .env" "Red"
        return
    }
    
    $managerIp = $baseIpLine.ToString().Split("=")[1]
    $baseIp = $managerIp.Substring(0, $managerIp.LastIndexOf('.'))

    Log-Message "[*] Escaneando red $baseIp.0/24..." "Blue"

    for ($i = 2; $i -le 254; $i++) {
        $ip = "$baseIp.$i"
        if (Test-Connection -ComputerName $ip -Count 1 -Quiet) {
            Log-Message "Nodo activo: $ip" "Green"
        }
    }
}

# Guided Mode
function Guided-Mode {
    if (-not (Select-Environment)) { return }
    if (-not (Select-NetworkMode)) { return }

    Read-Host "Paso 1: Limpiar entorno → ENTER para continuar"
    Cleanup-All

    Read-Host "Paso 2: Levantar VMs sin provisión → ENTER para continuar"
    vagrant up workerDocker1 --no-provision
    vagrant up workerDocker2 --no-provision
    vagrant up managerDocker --no-provision

    Read-Host "Paso 3: Instalar Docker e inicializar Swarm en manager → ENTER"
    vagrant provision managerDocker --provision-with fix-dns,docker-install,swarm-init

    Read-Host "Paso 4: Unir workers al Swarm → ENTER"
    vagrant provision workerDocker1
    vagrant provision workerDocker2

    Read-Host "Paso 5: Desplegar Stack → ENTER"
    vagrant provision managerDocker --provision-with deploy-stack

    $managerIp = "192.168.100.2"
    if (Test-Path $ENV_FILE) {
        $line = Get-Content $ENV_FILE | Select-String "MANAGER_IP="
        if ($line) { $managerIp = $line.ToString().Split("=")[1] }
    }
    
    Log-Message "[✔] PROCESO COMPLETADO" "Green"
    Show-Links
}

# Deploy Swarm (Automatic)
function Deploy-Swarm {
    Log-Message "========== DEPLOY AUTOMATICO ==========" "Blue"

    if (-not (Select-Environment)) { return }
    if (-not (Select-NetworkMode)) { return }

    Cleanup-All

    Log-Message "[*] Levantando VMs sin provisión..." "Yellow"
    vagrant up workerDocker1 --no-provision
    vagrant up workerDocker2 --no-provision
    vagrant up managerDocker --no-provision

    Log-Message "[*] Provisionando manager (Docker + Swarm)..." "Yellow"
    vagrant provision managerDocker --provision-with fix-dns,docker-install,swarm-init

    Log-Message "[*] Provisionando workers..." "Yellow"
    vagrant provision workerDocker1
    vagrant provision workerDocker2

    Log-Message "[*] Esperando que el cluster esté completo..." "Yellow"
    if (-not (Wait-For-Nodes)) {
        Log-Message "[!] Cluster no listo tras espera. Revisa 'vagrant status'." "Red"
        return
    }

    Log-Message "[*] Desplegando Stack..." "Yellow"
    vagrant provision managerDocker --provision-with deploy-stack

    $managerIp = "192.168.100.2"
    if (Test-Path $ENV_FILE) {
        $line = Get-Content $ENV_FILE | Select-String "MANAGER_IP="
        if ($line) { $managerIp = $line.ToString().Split("=")[1] }
    }

    # Inject hosts
    Inject-Hosts $managerIp "simcomp.co"
    Inject-Hosts $managerIp "simcomp.local"

    Log-Message "[✔] CLUSTER LISTO Y MONITOREADO" "Green"
    Show-Links
}

# Main Menu
while ($true) {
    Clear-Host
    Log-Message "======================================" "Blue"
    Log-Message "   SIMCOMP INFRA MANAGER - WINDOWS" "Blue"
    Log-Message "======================================" "Blue"

    # Solo mostramos el estado rápido
    $managerIp = "192.168.100.2"
    if (Test-Path $ENV_FILE) {
        $line = Get-Content $ENV_FILE | Select-String "MANAGER_IP="
        if ($line) { $managerIp = $line.ToString().Split("=")[1] }
    }

    if (Test-Connection -ComputerName $managerIp -Count 1 -Quiet -ErrorAction SilentlyContinue) {
        Log-Message "Estado: Online" "Green"
        Show-Links
    } else {
        Log-Message "Estado: Offline (Usa la opción 4 para iniciar)" "Red"
    }

    Log-Message "======================================" "White"
    Log-Message "1) Paso a paso"
    Log-Message "2) Semi automático"
    Log-Message "3) Automático completo"
    Log-Message "4) Iniciar VMs"
    Log-Message "5) Apagar VMs"
    Log-Message "6) Deploy stack"
    Log-Message "7) Pruebas JMeter (CLI)"
    Log-Message "8) Limpiar TODO"
    Log-Message "9) Auto-discovery red"
    Log-Message "10) Unir nodo remoto"
    Log-Message "11) Ver Logs"
    Log-Message "12) Salir"
    Log-Message "======================================" "White"

    $opt = Read-Host "Opción"

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
        "9" { Auto-Discovery }
        "10" { Join-RemoteWorker }
        "11" { Get-Content $LOG_FILE -Wait -Tail 20 }
        "12" { exit }
        Default { Log-Message "[!] Opción inválida" "Red" }
    }

    Read-Host "ENTER para continuar..."
}