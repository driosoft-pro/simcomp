# local-docker-manager.ps1 - Gestión del entorno completo vía Docker Compose (Windows)
# =============================================================================

function Detect-Engine {
    if (Get-Command podman -ErrorAction SilentlyContinue) {
        return "podman"
    }
    else {
        return "docker"
    }
}

$ENGINE = Detect-Engine

function Show-Links {
    Write-Host "`n--- Enlaces de Acceso Docker (Full Stack) ---" -ForegroundColor Yellow
    Write-Host "Frontend (HAProxy): " -NoNewline; Write-Host "http://localhost:8080" -ForegroundColor Green
    Write-Host "Dashboard Stats:    " -NoNewline; Write-Host "http://localhost:8404/stats" -ForegroundColor Cyan; Write-Host " (admin:Admin123*)"
    Write-Host "----------------------------------------------------"
    Write-Host "Observabilidad:" -ForegroundColor Yellow
    Write-Host "Grafana:            " -NoNewline; Write-Host "http://localhost:3000" -ForegroundColor Green
    Write-Host "Prometheus:         " -NoNewline; Write-Host "http://localhost:9090" -ForegroundColor Green
    Write-Host "Glances (Monitor):  " -NoNewline; Write-Host "http://localhost:61208" -ForegroundColor Green
    Write-Host "----------------------------------------------------"
    Write-Host "Documentación API (Swagger):" -ForegroundColor Yellow
    Write-Host "Auth Service:       " -NoNewline; Write-Host "http://localhost:8001/api-docs" -ForegroundColor Cyan
    Write-Host "Personas:           " -NoNewline; Write-Host "http://localhost:8002/api-docs" -ForegroundColor Cyan
    Write-Host "Automotores:        " -NoNewline; Write-Host "http://localhost:8003/api-docs" -ForegroundColor Cyan
    Write-Host "Infracciones:       " -NoNewline; Write-Host "http://localhost:8004/api-docs" -ForegroundColor Cyan
    Write-Host "Comparendos:        " -NoNewline; Write-Host "http://localhost:8005/api-docs" -ForegroundColor Cyan
    Write-Host "Reportes:           " -NoNewline; Write-Host "http://localhost:8006/api-docs" -ForegroundColor Cyan
    Write-Host "----------------------------------------------------"
    Write-Host "Servicios Adicionales:" -ForegroundColor Yellow
    Write-Host "Analytics API:      " -NoNewline; Write-Host "http://localhost:8010" -ForegroundColor Cyan
    Write-Host "Spark UI:           " -NoNewline; Write-Host "http://localhost:4040" -ForegroundColor Cyan
    Write-Host "----------------------------------------------------"
}

function Show-Menu {
    Clear-Host
    Write-Host "====================================================" -ForegroundColor Cyan
    Write-Host "       SIMCOMP - GESTIÓN ENTORNO DOCKER (FULL)" -ForegroundColor Cyan
    Write-Host "====================================================" -ForegroundColor Cyan
    Write-Host "  [1] Levantar todo el stack (Up -d)"
    Write-Host "  [2] Detener todo el stack (Stop)"
    Write-Host "  [3] Reiniciar stack (Restart)"
    Write-Host "  [4] Bajar stack y borrar volúmenes (Down -v)"
    Write-Host "  [5] Ver estado de contenedores (PS)"
    Write-Host "  [6] Ver logs (Tail)"
    Write-Host "  [7] Ver Enlaces/URLs de Acceso"
    Write-Host "----------------------------------------------------" -ForegroundColor Cyan
    Write-Host "  [0] Salir"
    Write-Host "----------------------------------------------------" -ForegroundColor Cyan
    
    $choice = Read-Host " Selecciona una opción"

    switch ($choice) {
        "1" {
            Write-Host "[*] Levantando stack con $ENGINE..." -ForegroundColor Yellow
            & $ENGINE compose up -d --build
            Show-Links
        }
        "2" {
            Write-Host "[*] Deteniendo stack..." -ForegroundColor Yellow
            & $ENGINE compose stop
        }
        "3" {
            Write-Host "[*] Reiniciando stack..." -ForegroundColor Yellow
            & $ENGINE compose restart
        }
        "4" {
            Write-Host "[*] Bajando stack y limpiando volúmenes..." -ForegroundColor Yellow
            & $ENGINE compose down -v
        }
        "5" {
            Write-Host "[*] Estado de los contenedores:" -ForegroundColor Yellow
            & $ENGINE compose ps
        }
        "6" {
            Write-Host "[*] Mostrando logs (Ctrl+C para salir)..." -ForegroundColor Yellow
            & $ENGINE compose logs -f --tail 50
        }
        "7" {
            Show-Links
        }
        "0" {
            return
        }
        default {
            Write-Host " Opción inválida." -ForegroundColor Red
        }
    }
    
    Read-Host "`n Presiona Enter para continuar..."
    Show-Menu
}

# Iniciar el menú
Show-Menu
