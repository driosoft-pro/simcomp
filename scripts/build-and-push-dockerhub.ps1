# =========================================================
# SIMCOMP - Build & Push to Docker Hub
# Compatible con Docker y Podman
# Windows / PowerShell
# =========================================================

$Action = if ($args[0]) { $args[0] } else { "all" }
$TargetService = if ($args[1]) { $args[1] } else { "" }

$EnvFile = ".env.docker-push"

# ---------- Colores ----------
function Write-Info($msg) { Write-Host "[INFO]  $msg" -ForegroundColor Cyan }
function Write-Ok($msg) { Write-Host "[OK]    $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "[WARN]  $msg" -ForegroundColor Yellow }
function Write-Fail($msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red; exit 1 }

# ---------- Cargar .env ----------
function Load-Env() {
    if (Test-Path $EnvFile) {
        Write-Info "Cargando variables desde $EnvFile"
        Get-Content $EnvFile | Where-Object { $_ -notmatch "^#" -and $_ -match "=" } | ForEach-Object {
            $name, $value = $_.Split('=', 2)
            [System.Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim())
        }
    } elseif (Test-Path ".env") {
        Get-Content ".env" | Where-Object { $_ -notmatch "^#" -and $_ -match "=" } | ForEach-Object {
            $name, $value = $_.Split('=', 2)
            [System.Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim())
        }
    }
}

# ---------- Detectar CLI ----------
function Get-Cli() {
    if (Get-Command podman -ErrorAction SilentlyContinue) {
        return "podman"
    } elseif (Get-Command docker -ErrorAction SilentlyContinue) {
        return "docker"
    } else {
        Write-Fail "No se encontr   docker ni podman"
    }
}

# ---------- Validar Dockerfile ----------
function Test-ValidContext($path) {
    return (Test-Path $path) -and (Test-Path "$path/Dockerfile")
}

# ---------- Config ----------
# ---------- Cargar Configuraci  n ----------
Load-Env
$Cli = Get-Cli

$DockerHubUser = if ($Action -ne "build") { Read-Host "Ingrese su usuario de Docker Hub" } else { "deytonro" }
$DockerHubPass = if ($Action -ne "build") { Read-Host "Ingrese su contrase  a de Docker Hub (no se mostrar  )" -AsSecureString } else { "" }
$Version = if ($env:VERSION) { $env:VERSION } else { "v1.0.0" }
$Registry = if ($env:REGISTRY) { $env:REGISTRY } else { "docker.io" }

# Convertir secure string a plain text para docker login si es necesario
if ($DockerHubPass -is [System.Security.SecureString]) {
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($DockerHubPass)
    $DockerHubPassPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
} else {
    $DockerHubPassPlain = $DockerHubPass
}

# ---------- Servicios ----------
$Services = @(
    "simcomp-auth-db|./backend/ms-auth-service/db",
    "simcomp-personas-db|./backend/ms-personas/db",
    "simcomp-automotores-db|./backend/ms-automotores/db",
    "simcomp-infracciones-db|./backend/ms-infracciones/db",
    "simcomp-comparendos-db|./backend/ms-comparendos/db",
    "simcomp-reportes-db|./backend/ms-reportes/db",

    "simcomp-auth-service|./backend/ms-auth-service",
    "simcomp-personas-service|./backend/ms-personas",
    "simcomp-automotores-service|./backend/ms-automotores",
    "simcomp-infracciones-service|./backend/ms-infracciones",
    "simcomp-comparendos-service|./backend/ms-comparendos",
    "simcomp-reportes-service|./backend/ms-reportes",

    "simcomp-frontend|./frontend",
    "simcomp-gateway|./provisioning_docker/nginx",
    "simcomp-haproxy-balance|./provisioning_docker/haproxy",
    "simcomp-analytics-spark-service|./analytics-spark-service"
)

$Built = @()

# ---------- Filtrar servicio ----------
if ($TargetService) {
    $Services = $Services | Where-Object { $_ -like "$TargetService|*" }
    if ($Services.Count -eq 0) { Write-Fail "Servicio no encontrado: $TargetService" }
    Write-Info "Filtrado: $TargetService"
}

# ---------- Login ----------
function Login-Registry() {
    if (-not $DockerHubPass) {
        Write-Warn "Sin DOCKERHUB_PASS     usa docker login manual"
        return
    }

    Write-Info "Autenticando en $Registry..."
    $DockerHubPassPlain | & $Cli login $Registry -u $DockerHubUser --password-stdin
}

# ---------- Build ----------
function Build-Images() {
    foreach ($svc in $Services) {
        $parts = $svc.Split('|')
        $Name = $parts[0]
        $Context = $parts[1]

        if ($DockerHubUser) {
            $VersionTag = "$Registry/$DockerHubUser/$Name:$Version"
            $LatestTag = "$Registry/$DockerHubUser/$Name:latest"
        } else {
            $VersionTag = "$Name:$Version"
            $LatestTag = "$Name:latest"
        }

        if (-not (Test-ValidContext $Context)) {
            Write-Warn "Saltando $Name (sin Dockerfile en $Context)"
            continue
        }

        Write-Info "Construyendo $Name ..."
        & $Cli build -t $VersionTag $Context
        if ($LASTEXITCODE -eq 0) {
            & $Cli tag $VersionTag $LatestTag
            $script:Built += $svc
            Write-Ok "$Name construido"
        } else {
            Write-Warn "Error construyendo $Name. Se saltar   este servicio."
        }
    }
}

# ---------- Push ----------
function Push-Images() {
    $list = if ($Built.Count -gt 0) { $Built } else { $Services }

    foreach ($svc in $list) {
        $parts = $svc.Split('|')
        $Name = $parts[0]

        $VersionTag = "$Registry/$DockerHubUser/$Name:$Version"
        $LatestTag = "$Registry/$DockerHubUser/$Name:latest"

        Write-Info "Subiendo $Name ..."
        & $Cli push $VersionTag
        & $Cli push $LatestTag

        Write-Ok "$Name subido"
    }
}

# ---------- Limpieza ----------
function Remove-DanglingImages() {
    Write-Info "Buscando y limpiando im  genes sin etiqueta (<none>) ..."
    $dangling = & $Cli images -f "dangling=true" -q
    if ($dangling) {
        Write-Info "Se encontraron im  genes hu  rfanas. Procediendo a eliminar..."
        & $Cli rmi -f $dangling
        Write-Ok "Im  genes hu  rfanas eliminadas."
    } else {
        Write-Info "No se encontraron im  genes hu  rfanas."
    }
}

# ---------- Ejecuci  n ----------
Write-Info "CLI: $Cli | Usuario: $DockerHubUser | Versi  n: $Version | Acci  n: $Action"

switch ($Action) {
    "build" { Build-Images }
    "push" { Login-Registry; Push-Images }
    "all" { Login-Registry; Build-Images; Push-Images; Remove-DanglingImages }
    Default { Write-Fail "Acci  n invalida: build | push | all" }
}

Write-Host ""
Write-Ok "Proceso finalizado"