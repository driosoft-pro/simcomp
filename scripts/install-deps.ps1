# SIMCOMP - INSTALADOR DE DEPENDENCIAS (WINDOWS)
# Instala dependencias para microservicios y frontend usando pnpm o npm

$directories = @(
    "frontend",
    "backend\ms-auth-service",
    "backend\ms-automotores",
    "backend\ms-comparendos",
    "backend\ms-infracciones",
    "backend\ms-personas",
    "backend\ms-reportes"
)

function Install-Dependencies {
    param([string]$dir)
    
    Write-Host "====================================================" -ForegroundColor Cyan
    Write-Host " Procesando: $dir" -ForegroundColor Cyan
    Write-Host "====================================================" -ForegroundColor Cyan

    if (Test-Path $dir) {
        Push-Location $dir
        
        if (Test-Path "pnpm-lock.yaml") {
            Write-Host " [!] pnpm detectado. Ejecutando 'pnpm install'..." -ForegroundColor Yellow
            if (Get-Command pnpm -ErrorAction SilentlyContinue) {
                pnpm install
            } else {
                Write-Host " [X] pnpm no está instalado. Intentando con npm..." -ForegroundColor Magenta
                npm install
            }
        } elseif (Test-Path "package.json") {
            Write-Host " [!] package.json detectado. Ejecutando 'npm install'..." -ForegroundColor Yellow
            npm install
        } else {
            Write-Host " [?] No se encontró package.json en $dir. Saltando..." -ForegroundColor Gray
        }
        
        Pop-Location
    } else {
        Write-Host " [X] El directorio $dir no existe. Saltando..." -ForegroundColor Red
    }
    Write-Host ""
}

foreach ($dir in $directories) {
    Install-Dependencies $dir
}

Write-Host "====================================================" -ForegroundColor Green
Write-Host " [✔] Proceso de instalación finalizado." -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
