# =========================================================
# SIMCOMP - Build & Push to Docker Hub
# Compatible con Docker y Podman
# Windows PowerShell
# =========================================================

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [ValidateSet("build", "push", "all")]
    [string]$Action = "all",

    [Parameter(Position = 1)]
    [string]$TargetService = "",

    [string]$DockerHubUser = $env:DOCKERHUB_USER,
    [string]$DockerHubPass = $env:DOCKERHUB_PASS,
    [string]$Version = $env:VERSION,
    [string]$Registry = $env:REGISTRY,
    [string]$ContainerCli = $env:CONTAINER_CLI,
    [string]$EnvFile = ".env.docker-push"
)

$ErrorActionPreference = "Stop"

function Write-Info($msg) { Write-Host "[INFO]  $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "[OK]    $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "[WARN]  $msg" -ForegroundColor Yellow }
function Write-Fail($msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red }

function Invoke-CommandChecked {
    param(
        [Parameter(Mandatory = $true)]
        [string]$FilePath,

        [Parameter(Mandatory = $true)]
        [string[]]$Arguments,
        
        [string]$InputObject = $null
    )

    if ($InputObject) {
        $InputObject | & $FilePath @Arguments
    } else {
        & $FilePath @Arguments
    }

    if ($LASTEXITCODE -ne 0) {
        throw "Falló el comando: $FilePath $($Arguments -join ' ')"
    }
}

function Load-EnvFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if (!(Test-Path $Path)) {
        Write-Warn "No se encontró $Path. Usando variables por defecto."
        return
    }

    Write-Info "Cargando configuración desde $Path ..."
    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()

        if ([string]::IsNullOrWhiteSpace($line)) { return }
        if ($line.StartsWith("#")) { return }
        if ($line -notmatch "=") { return }

        $name, $value = $line -split "=", 2
        $name = $name.Trim()
        $value = $value.Trim().Trim('"').Trim("'")

        Set-Item -Path "Env:$name" -Value $value
    }
}

function Get-ContainerCli {
    param(
        [string]$PreferredCli
    )

    if ($PreferredCli) {
        if (Get-Command $PreferredCli -ErrorAction SilentlyContinue) {
            return $PreferredCli
        }
        throw "La CLI especificada '$PreferredCli' no existe en el sistema."
    }

    if (Get-Command "podman" -ErrorAction SilentlyContinue) { return "podman" }
    if (Get-Command "docker" -ErrorAction SilentlyContinue) { return "docker" }

    throw "No se encontró ni docker ni podman instalado."
}

function Test-BuildContext {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Context
    )

    if (!(Test-Path $Context)) {
        return $false
    }

    $dockerfilePath = Join-Path $Context "Dockerfile"
    return (Test-Path $dockerfilePath)
}

# ---------- Cargar variables ----------
Load-EnvFile -Path $EnvFile

if (!$DockerHubUser) { $DockerHubUser = if ($env:DOCKERHUB_USER) { $env:DOCKERHUB_USER } else { "tu_usuario" } }
if (!$DockerHubPass) { $DockerHubPass = $env:DOCKERHUB_PASS }
if (!$Version)       { $Version       = if ($env:VERSION)        { $env:VERSION }        else { "v1.0.0" } }
if (!$Registry)      { $Registry      = if ($env:REGISTRY)       { $env:REGISTRY }       else { "docker.io" } }

$CLI = Get-ContainerCli -PreferredCli $ContainerCli

$Services = @(
    @{ Name = "simcomp-auth-db";             Context = "./backend/ms-auth-service/db" },
    @{ Name = "simcomp-personas-db";         Context = "./backend/ms-personas/db" },
    @{ Name = "simcomp-automotores-db";      Context = "./backend/ms-automotores/db" },
    @{ Name = "simcomp-infracciones-db";     Context = "./backend/ms-infracciones/db" },
    @{ Name = "simcomp-comparendos-db";      Context = "./backend/ms-comparendos/db" },
    @{ Name = "simcomp-reportes-db";         Context = "./backend/ms-reportes/db" },

    @{ Name = "simcomp-auth-service";        Context = "./backend/ms-auth-service" },
    @{ Name = "simcomp-personas-service";    Context = "./backend/ms-personas" },
    @{ Name = "simcomp-automotores-service"; Context = "./backend/ms-automotores" },
    @{ Name = "simcomp-infracciones-service";Context = "./backend/ms-infracciones" },
    @{ Name = "simcomp-comparendos-service"; Context = "./backend/ms-comparendos" },
    @{ Name = "simcomp-reportes-service";    Context = "./backend/ms-reportes" },

    @{ Name = "simcomp-frontend";            Context = "./frontend" },
    @{ Name = "simcomp-gateway";             Context = "./provisioning_docker/nginx" },
    @{ Name = "simcomp-haproxy-balance";     Context = "./haproxy" }
)

# Filtrar si se especificó un servicio
if ($TargetService) {
    $filtered = $Services | Where-Object { $_.Name -eq $TargetService }
    if (!$filtered) {
        Write-Fail "Servicio no encontrado: $TargetService"
        exit 1
    }
    $Services = @($filtered)
    Write-Info "Filtrado para procesar solo: $TargetService"
}

$BuiltServices = New-Object System.Collections.Generic.List[object]

function Login-Registry {
    Write-Info "Autenticando en $Registry con $CLI ..."
    if ($DockerHubPass) {
        Invoke-CommandChecked -FilePath $CLI -Arguments @("login", $Registry, "-u", $DockerHubUser, "--password-stdin") -InputObject $DockerHubPass
        Write-Ok "Autenticación automática completada."
    } else {
        Write-Warn "DOCKERHUB_PASS no definido. Se requerirá login manual."
        Invoke-CommandChecked -FilePath $CLI -Arguments @("login", $Registry)
    }
}

function Build-Images {
    foreach ($service in $Services) {
        $imageName = $service.Name
        $context = $service.Context
        $versionTag = "${Registry}/${DockerHubUser}/${imageName}:${Version}"
        $latestTag  = "${Registry}/${DockerHubUser}/${imageName}:latest"

        if (!(Test-BuildContext -Context $context)) {
            Write-Warn "Saltando ${imageName}: no existe el contexto o falta Dockerfile en $context"
            continue
        }

        Write-Info "Construyendo $imageName ..."
        Invoke-CommandChecked -FilePath $CLI -Arguments @("build", "-t", $versionTag, $context)
        Invoke-CommandChecked -FilePath $CLI -Arguments @("tag", $versionTag, $latestTag)

        $BuiltServices.Add($service) | Out-Null
        Write-Ok "$imageName construido correctamente."
    }
}

function Push-Images {
    $toPush = if ($BuiltServices.Count -gt 0) { $BuiltServices } else { $Services }

    foreach ($service in $toPush) {
        $imageName = $service.Name
        $versionTag = "${Registry}/${DockerHubUser}/${imageName}:${Version}"
        $latestTag  = "${Registry}/${DockerHubUser}/${imageName}:latest"

        Write-Info "Subiendo $imageName ..."
        Invoke-CommandChecked -FilePath $CLI -Arguments @("push", $versionTag)
        Invoke-CommandChecked -FilePath $CLI -Arguments @("push", $latestTag)
        Write-Ok "$imageName subido correctamente."
    }
}

Write-Info "CLI: $CLI | Usuario: $DockerHubUser | Versión: $Version | Acción: $Action"

switch ($Action) {
    "build" {
        Build-Images
    }
    "push" {
        Login-Registry
        Push-Images
    }
    "all" {
        Login-Registry
        Build-Images
        Push-Images
    }
}

Write-Host ""
Write-Ok "Proceso finalizado correctamente."