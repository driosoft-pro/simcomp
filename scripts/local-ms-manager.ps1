# local-ms-manager.ps1 - Gesti  n de microservicios locales (Windows)
# =============================================================================

$BASE_DIR = "$PSScriptRoot\.."
$BACKEND_DIR = "$BASE_DIR\backend"

$SERVICES = @(
    "ms-auth-service",
    "ms-personas",
    "ms-automotores",
    "ms-infracciones",
    "ms-comparendos",
    "ms-reportes"
)

$PORTS = @{
    "ms-auth-service" = 8001
    "ms-personas"     = 8002
    "ms-automotores"  = 8003
    "ms-infracciones" = 8004
    "ms-comparendos"  = 8005
    "ms-reportes"     = 8006
}

function Log-Message {
    param([string]$message, [string]$color = "Cyan")
    Write-Host "[*] $message" -ForegroundColor $color
}

function Stop-ServiceProcess {
    param($service)
    $port = $PORTS[$service]
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($process) {
        Log-Message "Deteniendo $service en puerto $port (PID: $($process.OwningProcess))..." "Yellow"
        Stop-Process -Id $process.OwningProcess -Force
        Write-Host "[   ] $service detenido." -ForegroundColor Green
    } else {
        Log-Message "$service no parece estar ejecut  ndose." "Gray"
    }
}

function Start-ServiceProcess {
    param($service)
    Log-Message "Iniciando $service..." "Green"
    Push-Location "$BACKEND_DIR\$service"
    
    $command = if (Get-Command "pnpm" -ErrorAction SilentlyContinue) { "pnpm dev" } else { "npm run dev" }
    
    # Start-Process runs in a separate window or background
    Start-Process powershell -ArgumentList "-NoProfile -Command $command" -WindowStyle Minimized
    
    Pop-Location
}

function Show-Status {
    Write-Host "`nEstado de microservicios (Windows):" -ForegroundColor Yellow
    Write-Host "----------------------------------------------------"
    foreach ($s in $SERVICES) {
        $port = $PORTS[$s]
        $active = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        $status = if ($active) { "RUNNING" } else { "STOPPED" }
        $color = if ($active) { "Green" } else { "Red" }
        
        Write-Host "$($s.PadRight(25)) Port: $($port.ToString().PadRight(10)) " -NoNewline
        Write-Host "$status" -ForegroundColor $color
    }
    Write-Host "----------------------------------------------------`n"
}

$action = if ($args[0]) { $args[0] } else { "status" }
$service = if ($args[1]) { $args[1] } else { "all" }

switch ($action) {
    "start" {
        if ($service -eq "all") {
            foreach ($s in $SERVICES) { Start-ServiceProcess $s }
        } else {
            Start-ServiceProcess $service
        }
    }
    "stop" {
        if ($service -eq "all") {
            foreach ($s in $SERVICES) { Stop-ServiceProcess $s }
        } else {
            Stop-ServiceProcess $service
        }
    }
    "status" {
        Show-Status
    }
    Default {
        Write-Host "Uso: .\local-ms-manager.ps1 {start|stop|status} [servicio|all]"
    }
}
