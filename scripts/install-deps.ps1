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

function Check-And-Install-Pnpm {
    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
        Write-Host " [!] pnpm no esta instalado. Intentando instalar via npm..." -ForegroundColor Yellow
        if (Get-Command npm -ErrorAction SilentlyContinue) {
            npm install -g pnpm
            if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
                Write-Host " [X] Error al instalar pnpm. Asegurese de tener permisos de administrador." -ForegroundColor Red
                return $false
            }
            Write-Host " [OK] pnpm instalado correctamente." -ForegroundColor Green
        } else {
            Write-Host " [X] No se encontro 'npm'. Por favor, instale Node.js primero (https://nodejs.org/)." -ForegroundColor Red
            return $false
        }
    }
    return $true
}

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
                pnpm install --no-frozen-lockfile
                # Aprobacion automatica para pnpm 10
                pnpm approve-builds @scarf/scarf 2>$null
                if ($dir -eq "frontend") { pnpm approve-builds esbuild 2>$null }
                if ($dir -like "*ms-auth-service") { pnpm approve-builds bcrypt 2>$null }
            } else {
                Write-Host " [X] pnpm no esta instalado. Intentando con npm..." -ForegroundColor Magenta
                npm install
            }
        } elseif (Test-Path "package.json") {
            Write-Host " [!] package.json detectado. Ejecutando 'npm install'..." -ForegroundColor Yellow
            npm install
        } else {
            Write-Host " [?] No se encontro package.json en $dir. Saltando..." -ForegroundColor Gray
        }
        
        Pop-Location
    } else {
        Write-Host " [X] El directorio $dir no existe. Saltando..." -ForegroundColor Red
    }
    Write-Host ""
}

if (Check-And-Install-Pnpm) {
    foreach ($dir in $directories) {
        Install-Dependencies $dir
    }
} else {
    Write-Host " [X] No se puede continuar sin pnpm o npm." -ForegroundColor Red
}


Write-Host "====================================================" -ForegroundColor Green
Write-Host " [OK] Proceso de instalacion finalizado." -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
