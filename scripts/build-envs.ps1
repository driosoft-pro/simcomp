<#
.SYNOPSIS
Script para generar archivos .env, .env.local, .env.swarm, .env.vagrant a partir de .env.example

.DESCRIPTION
Este script lee los archivos .env.example de cada microservicio y del frontend,
separando sus diferentes secciones para generar automáticamente todos los entornos.
#>

$ErrorActionPreference = "Stop"

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "  SIMCOMP - Generador de Entornos (.env) a partir de .env.example" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "Este script recreará los archivos .env, .env.local, .env.vagrant y .env.swarm"
Write-Host "para todos los microservicios y el frontend."
Write-Host ""

# Obtener la ruta real donde está este script
$scriptPath = $PSScriptRoot

if ([string]::IsNullOrWhiteSpace($scriptPath)) {
    $scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
}

# Como este script está dentro de /scripts, la raíz del proyecto es un nivel arriba
$projectRoot = Resolve-Path (Join-Path $scriptPath "..")

Write-Host "[INFO] Raíz del proyecto detectada: $projectRoot" -ForegroundColor Cyan
Write-Host ""

$services = @(
    ".",
    "provisioning_docker",
    "backend/ms-auth-service",
    "backend/ms-automotores",
    "backend/ms-comparendos",
    "backend/ms-infracciones",
    "backend/ms-personas",
    "backend/ms-reportes",
    "analytics-spark-service",
    "frontend"
)

# Codificación UTF-8 sin BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

foreach ($service in $services) {

    $servicePath = Join-Path $projectRoot $service
    $examplePath = Join-Path $servicePath ".env.example"

    if (-not (Test-Path $servicePath -PathType Container)) {
        Write-Host "[-] Saltando $service (No existe la carpeta del servicio)" -ForegroundColor Yellow
        continue
    }

    if (-not (Test-Path $examplePath -PathType Leaf)) {
        Write-Host "[-] Saltando $service (No se encontró .env.example)" -ForegroundColor Yellow
        continue
    }

    Write-Host "[+] Procesando: $service" -ForegroundColor Green

    $lines = Get-Content -LiteralPath $examplePath

    $mode = "shared"
    $shared = @()
    $local_env = @()
    $vagrant_env = @()
    $docker_env = @()
    $swarm_env = @()
    $default_env = @()

    foreach ($line in $lines) {

        if ($line -match "^#\s*1\.") {
            $mode = "local"
            continue
        }

        if ($line -match "^#\s*2\.") {
            $mode = "vagrant"
            continue
        }

        if ($line -match "^#\s*3\.") {
            $mode = "docker"
            continue
        }

        if ($line -match "^#\s*4\.") {
            $mode = "swarm"
            continue
        }

        if ($line -match "^#\s*Configuración para desarrollo local") {
            $mode = "skip"
            continue
        }

        if ($line -match "^#\s*DEFAULT / PRODUCTION") {
            $mode = "default"
            continue
        }

        if ($mode -eq "skip") {
            continue
        }

        $processedLine = $line

        # Descomentar variables tipo:
        # VAR=VALOR
        #VAR=VALOR
        if ($processedLine -match "^#\s+([a-zA-Z0-9_]+=.*)") {
            $processedLine = $matches[1]
        }
        elseif ($processedLine -match "^#([a-zA-Z0-9_]+=.*)") {
            $processedLine = $matches[1]
        }

        switch ($mode) {
            "shared"  { $shared += $processedLine }
            "local"   { $local_env += $processedLine }
            "vagrant" { $vagrant_env += $processedLine }
            "docker"  { $docker_env += $processedLine }
            "swarm"   { $swarm_env += $processedLine }
            "default" { $default_env += $processedLine }
        }
    }

    $localPath = Join-Path $servicePath ".env.local"
    $vagrantPath = Join-Path $servicePath ".env.vagrant"
    $dockerPath = Join-Path $servicePath ".env"
    $swarmPath = Join-Path $servicePath ".env.swarm"

    try {
        [System.IO.File]::WriteAllLines($localPath, [string[]]($shared + $local_env), $utf8NoBom)
        [System.IO.File]::WriteAllLines($vagrantPath, [string[]]($shared + $vagrant_env), $utf8NoBom)
        [System.IO.File]::WriteAllLines($dockerPath, [string[]]($shared + $docker_env), $utf8NoBom)

        $swarmContent = @()
        $swarmContent += $shared
        $swarmContent += $swarm_env

        if ($default_env.Count -gt 0) {
            $swarmContent += $default_env
        }

        [System.IO.File]::WriteAllLines($swarmPath, [string[]]$swarmContent, $utf8NoBom)

        Write-Host "    -> Creados: .env, .env.local, .env.vagrant, .env.swarm" -ForegroundColor Gray
    }
    catch {
        Write-Host "[ERROR] No se pudieron crear los archivos para $service" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        throw
    }
}

Write-Host ""
Write-Host "¡Generación completada! Todos los entornos están listos para usarse." -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan