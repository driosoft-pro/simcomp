<#
.SYNOPSIS
Script para generar archivos .env, .env.local, .env.swarm, .env.vagrant a partir de .env.example

.DESCRIPTION
Este script lee los archivos .env.example de cada microservicio y del frontend,
separando sus diferentes secciones para generar automáticamente todos los entornos.
#>

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "  SIMCOMP - Generador de Entornos (.env) a partir de .env.example" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "Este script recreará los archivos .env, .env.local, .env.vagrant y .env.swarm"
Write-Host "para todos los microservicios y el frontend."
Write-Host ""

# Moverse a la raíz del proyecto
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location -Path (Join-Path $scriptPath "..")

$services = @(
  "backend/ms-auth-service",
  "backend/ms-automotores",
  "backend/ms-comparendos",
  "backend/ms-infracciones",
  "backend/ms-personas",
  "backend/ms-reportes",
  "analytics-spark-service",
  "frontend"
)

foreach ($service in $services) {
    $examplePath = Join-Path $service ".env.example"
    if (Test-Path $examplePath) {
        Write-Host "[+] Procesando: $service" -ForegroundColor Green
        
        $lines = Get-Content $examplePath
        
        $mode = "shared"
        $shared = @()
        $local_env = @()
        $vagrant_env = @()
        $docker_env = @()
        $swarm_env = @()
        $default_env = @()
        
        foreach ($line in $lines) {
            if ($line -match "^# 1\. ") { $mode = "local"; continue }
            if ($line -match "^# 2\. ") { $mode = "vagrant"; continue }
            if ($line -match "^# 3\. ") { $mode = "docker"; continue }
            if ($line -match "^# 4\. ") { $mode = "swarm"; continue }
            if ($line -match "^# Configuración para desarrollo local") { $mode = "skip"; continue }
            if ($line -match "^# DEFAULT / PRODUCTION") { $mode = "default"; continue }
            
            if ($mode -eq "skip") { continue }
            
            $processedLine = $line
            # Descomentar variables (ej: "# VAR=VAL" -> "VAR=VAL")
            if ($processedLine -match "^# ([a-zA-Z0-9_]+=.*)") {
                $processedLine = $matches[1]
            } elseif ($processedLine -match "^#([a-zA-Z0-9_]+=.*)") {
                $processedLine = $matches[1]
            }
            
            switch ($mode) {
                "shared" { $shared += $processedLine }
                "local" { $local_env += $processedLine }
                "vagrant" { $vagrant_env += $processedLine }
                "docker" { $docker_env += $processedLine }
                "swarm" { $swarm_env += $processedLine }
                "default" { $default_env += $processedLine }
            }
        }
        
        $localPath = Join-Path $service ".env.local"
        $vagrantPath = Join-Path $service ".env.vagrant"
        $dockerPath = Join-Path $service ".env"
        $swarmPath = Join-Path $service ".env.swarm"
        
        # Guardar archivos (evitando el BOM en PowerShell)
        [System.IO.File]::WriteAllLines($localPath, ($shared + $local_env))
        [System.IO.File]::WriteAllLines($vagrantPath, ($shared + $vagrant_env))
        [System.IO.File]::WriteAllLines($dockerPath, ($shared + $docker_env))
        
        $swarmContent = $shared + $swarm_env
        if ($default_env.Count -gt 0) {
            $swarmContent += $default_env
        }
        [System.IO.File]::WriteAllLines($swarmPath, $swarmContent)
        
        Write-Host "    -> Creados: .env, .env.local, .env.vagrant, .env.swarm"
    } else {
        Write-Host "[-] Saltando $service (No se encontró .env.example)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "¡Generación completada! Todos los entornos están listos para usarse." -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
