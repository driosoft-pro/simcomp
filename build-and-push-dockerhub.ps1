# =========================================================
# SIMCOMP - Build & Push to Docker Hub
# Compatible con Docker y Podman
# Windows PowerShell
# =========================================================

[CmdletBinding()]
param(
    [string]$DockerHubUser = $(if ($env:DOCKERHUB_USER) { $env:DOCKERHUB_USER } else { "deytonro" }),
    [string]$Version = $(if ($env:VERSION) { $env:VERSION } else { "v1.0.0" }),
    [string]$Registry = $(if ($env:REGISTRY) { $env:REGISTRY } else { "docker.io" }),
    [string]$ContainerCli = $env:CONTAINER_CLI
)

$ErrorActionPreference = "Stop"

function Write-Info($msg)  { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Ok($msg)    { Write-Host "[OK]   $msg" -ForegroundColor Green }
function Write-Warn($msg)  { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Fail($msg)  { Write-Host "[ERROR] $msg" -ForegroundColor Red }

function Get-ContainerCli {
    if ($ContainerCli) { return $ContainerCli }
    if (Get-Command "docker" -ErrorAction SilentlyContinue) { return "docker" }
    if (Get-Command "podman" -ErrorAction SilentlyContinue) { return "podman" }
    throw "No se encontró ni docker ni podman instalado."
}

$CLI = Get-ContainerCli
$SERVICES = @(
    @{ Name = "simcomp-auth-db"; Context = "./backend/ms-auth-service/db" },
    @{ Name = "simcomp-personas-db"; Context = "./backend/ms-personas/db" },
    @{ Name = "simcomp-automotores-db"; Context = "./backend/ms-automotores/db" },
    @{ Name = "simcomp-infracciones-db"; Context = "./backend/ms-infracciones/db" },
    @{ Name = "simcomp-comparendos-db"; Context = "./backend/ms-comparendos/db" },
    @{ Name = "simcomp-auth-service"; Context = "./backend/ms-auth-service" },
    @{ Name = "simcomp-personas-service"; Context = "./backend/ms-personas" },
    @{ Name = "simcomp-automotores-service"; Context = "./backend/ms-automotores" },
    @{ Name = "simcomp-infracciones-service"; Context = "./backend/ms-infracciones" },
    @{ Name = "simcomp-comparendos-service"; Context = "./backend/ms-comparendos" },
    @{ Name = "simcomp-reportes-service"; Context = "./backend/ms-reportes" },
    @{ Name = "simcomp-frontend"; Context = "./frontend" },
    @{ Name = "simcomp-gateway"; Context = "./provisioning_docker/nginx" },
    @{ Name = "simcomp-haproxy-balance"; Context = "./haproxy" }
)

Write-Info "Usando CLI: $CLI | Usuario: $DockerHubUser | Versión: $Version"

# Login
Write-Info "Autenticando en $Registry..."
& $CLI login $Registry

# Build & Push
foreach ($service in $SERVICES) {
    $imageName = $service.Name
    $context = $service.Context
    $versionTag = "$Registry/$DockerHubUser/$imageName:$Version"
    $latestTag = "$Registry/$DockerHubUser/$imageName:latest"

    if (!(Test-Path $context)) {
        Write-Warn "Saltando $imageName: No existe el directorio $context"
        continue
    }

    # Build
    Write-Info "Construyendo $imageName..."
    & $CLI build -t $versionTag -t $latestTag $context
    Write-Ok "$imageName construido."

    # Push
    Write-Info "Subiendo $imageName..."
    & $CLI push $versionTag
    & $CLI push $latestTag
    Write-Ok "$imageName subido."
}

Write-Host ""
Write-Ok "Todo construido y subido correctamente a Docker Hub."