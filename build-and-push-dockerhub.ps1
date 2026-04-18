# =========================================================
# SIMCOMP - Build & Push to Docker Hub
# Compatible con Docker y Podman
# Windows PowerShell
# =========================================================

[CmdletBinding()]
param(
    [string]$DockerHubUser = $env:DOCKERHUB_USER,
    [string]$Version = $(if ($env:VERSION) { $env:VERSION } else { "v1.0.0" }),
    [string]$Registry = $(if ($env:REGISTRY) { $env:REGISTRY } else { "docker.io" }),
    [string]$ContainerCli = $env:CONTAINER_CLI,
    [string]$DockerHubToken = $env:DOCKERHUB_TOKEN
)

$ErrorActionPreference = "Stop"

function Write-Info($msg)  { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Ok($msg)    { Write-Host "[OK]   $msg" -ForegroundColor Green }
function Write-Warn($msg)  { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Fail($msg)  { Write-Host "[ERROR] $msg" -ForegroundColor Red }

function Test-CommandExists {
    param([string]$Name)
    return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Get-ContainerCli {
    if ($ContainerCli) {
        return $ContainerCli
    }

    if (Test-CommandExists "docker") {
        return "docker"
    }

    if (Test-CommandExists "podman") {
        return "podman"
    }

    throw "No se encontró ni docker ni podman instalado."
}

function Assert-ProjectRoot {
    if (!(Test-Path ".\backend") -or !(Test-Path ".\frontend")) {
        throw "Debes ejecutar este script desde la raíz del proyecto simcomp."
    }
}

function Login-Registry {
    param(
        [string]$Cli,
        [string]$Registry,
        [string]$DockerHubUser,
        [string]$DockerHubToken
    )

    Write-Info "Usando CLI: $Cli"
    Write-Info "Autenticando en $Registry"

    if ($DockerHubToken) {
        if (-not $DockerHubUser) {
            throw "Si usas DOCKERHUB_TOKEN, también debes definir DOCKERHUB_USER."
        }

        $DockerHubToken | & $Cli login -u $DockerHubUser --password-stdin $Registry
    }
    else {
        if (-not $DockerHubUser -or $DockerHubUser -eq "TU_USUARIO_DOCKERHUB") {
            throw "Debes definir DOCKERHUB_USER. Ejemplo: `$env:DOCKERHUB_USER='deytonro'"
        }

        & $Cli login -u $DockerHubUser $Registry
    }

    Write-Ok "Login correcto en $Registry"
}

function Build-Image {
    param(
        [string]$Cli,
        [string]$ImageName,
        [string]$ContextDir,
        [string]$Registry,
        [string]$DockerHubUser,
        [string]$Version
    )

    $versionTag = "$Registry/$DockerHubUser/${ImageName}:$Version"
    $latestTag = "$Registry/$DockerHubUser/${ImageName}:latest"

    if (!(Test-Path $ContextDir)) {
        throw "No existe el directorio: $ContextDir"
    }

    $dockerfilePath = Join-Path $ContextDir "Dockerfile"
    $containerfilePath = Join-Path $ContextDir "Containerfile"

    if (!(Test-Path $dockerfilePath) -and !(Test-Path $containerfilePath)) {
        throw "No se encontró Dockerfile/Containerfile en: $ContextDir"
    }

    Write-Info "Construyendo $ImageName desde $ContextDir"
    & $Cli build -t $versionTag $ContextDir

    Write-Info "Etiquetando $ImageName como latest"
    & $Cli tag $versionTag $latestTag

    Write-Ok "Build completado: $versionTag"
}

function Push-Image {
    param(
        [string]$Cli,
        [string]$ImageName,
        [string]$Registry,
        [string]$DockerHubUser,
        [string]$Version
    )

    $versionTag = "$Registry/$DockerHubUser/${ImageName}:$Version"
    $latestTag = "$Registry/$DockerHubUser/${ImageName}:latest"

    Write-Info "Subiendo $versionTag"
    & $Cli push $versionTag

    Write-Info "Subiendo $latestTag"
    & $Cli push $latestTag

    Write-Ok "Push completado: $ImageName"
}

function Print-Summary {
    param(
        [array]$Services,
        [string]$Registry,
        [string]$DockerHubUser,
        [string]$Version
    )

    Write-Host ""
    Write-Ok "Listo: imágenes construidas y subidas a Docker Hub"
    Write-Host ""
    Write-Host "Repositorio:"

    foreach ($svc in $Services) {
        Write-Host "  - $Registry/$DockerHubUser/$($svc.Name):$Version"
        Write-Host "  - $Registry/$DockerHubUser/$($svc.Name):latest"
    }
}

try {
    Assert-ProjectRoot

    if (-not $DockerHubUser -or $DockerHubUser -eq "TU_USUARIO_DOCKERHUB") {
        throw "Debes definir DOCKERHUB_USER. Ejemplo: `$env:DOCKERHUB_USER='deytonro'"
    }

    $Cli = Get-ContainerCli

    $Services = @(
        @{ Name = "simcomp-auth-service";         Context = ".\backend\ms-auth-service" },
        @{ Name = "simcomp-personas-service";     Context = ".\backend\ms-personas" },
        @{ Name = "simcomp-automotores-service";  Context = ".\backend\ms-automotores" },
        @{ Name = "simcomp-infracciones-service"; Context = ".\backend\ms-infracciones" },
        @{ Name = "simcomp-comparendos-service";  Context = ".\backend\ms-comparendos" },
        @{ Name = "simcomp-reportes-service";     Context = ".\backend\ms-reportes" },
        @{ Name = "simcomp-frontend";             Context = ".\frontend" }
    )

    Login-Registry -Cli $Cli -Registry $Registry -DockerHubUser $DockerHubUser -DockerHubToken $DockerHubToken

    foreach ($svc in $Services) {
        Build-Image -Cli $Cli -ImageName $svc.Name -ContextDir $svc.Context -Registry $Registry -DockerHubUser $DockerHubUser -Version $Version
    }

    foreach ($svc in $Services) {
        Push-Image -Cli $Cli -ImageName $svc.Name -Registry $Registry -DockerHubUser $DockerHubUser -Version $Version
    }

    Print-Summary -Services $Services -Registry $Registry -DockerHubUser $DockerHubUser -Version $Version
}
catch {
    Write-Fail $_.Exception.Message
    exit 1
}