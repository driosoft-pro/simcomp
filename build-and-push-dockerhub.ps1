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
    } else {
        Write-Warn "No se encontró $EnvFile, usando valores por defecto"
    }
}

# ---------- Detectar CLI ----------
function Get-Cli() {
    if (Get-Command podman -ErrorAction SilentlyContinue) {
        return "podman"
    } elseif (Get-Command docker -ErrorAction SilentlyContinue) {
        return "docker"
    } else {
        Write-Fail "No se encontró docker ni podman"
    }
}

# ---------- Validar Dockerfile ----------
function Test-ValidContext($path) {
    return (Test-Path $path) -and (Test-Path "$path/Dockerfile")
}

# ---------- Config ----------
Load-Env

$DockerHubUser = if ($env:DOCKERHUB_USER) { $env:DOCKERHUB_USER } else { "tu_usuario" }
$Version = if ($env:VERSION) { $env:VERSION } else { "v1.0.0" }
$Registry = if ($env:REGISTRY) { $env:REGISTRY } else { "docker.io" }
$DockerHubPass = $env:DOCKERHUB_PASS

$Cli = Get-Cli

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
    "simcomp-haproxy-balance|./provisioning_docker/haproxy"
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
        Write-Warn "Sin DOCKERHUB_PASS → usa docker login manual"
        return
    }

    Write-Info "Autenticando en $Registry..."
    $DockerHubPass | & $Cli login $Registry -u $DockerHubUser --password-stdin
}

# ---------- Build ----------
function Build-Images() {
    foreach ($svc in $Services) {
        $parts = $svc.Split('|')
        $Name = $parts[0]
        $Context = $parts[1]

        $VersionTag = "$Registry/$DockerHubUser/$Name:$Version"
        $LatestTag = "$Registry/$DockerHubUser/$Name:latest"

        if (-not (Test-ValidContext $Context)) {
            Write-Warn "Saltando $Name (sin Dockerfile en $Context)"
            continue
        }

        Write-Info "Construyendo $Name ..."
        & $Cli build -t $VersionTag $Context
        if ($LASTEXITCODE -ne 0) { Write-Fail "Error construyendo $Name" }
        
        & $Cli tag $VersionTag $LatestTag

        $script:Built += $svc
        Write-Ok "$Name construido"
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

# ---------- Ejecución ----------
Write-Info "CLI: $Cli | Usuario: $DockerHubUser | Versión: $Version | Acción: $Action"

switch ($Action) {
    "build" { Build-Images }
    "push" { Login-Registry; Push-Images }
    "all" { Login-Registry; Build-Images; Push-Images }
    Default { Write-Fail "Acción inválida: build | push | all" }
}

Write-Host ""
Write-Ok "Proceso finalizado"