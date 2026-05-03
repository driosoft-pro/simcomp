# SIMCOMP - GESTOR CENTRAL DE INFRAESTRUCTURA (WINDOWS)

function Show-Menu {
    Clear-Host
    Write-Host "====================================================" -ForegroundColor Cyan
    Write-Host "       SIMCOMP - PANEL DE CONTROL CENTRAL" -ForegroundColor Cyan
    Write-Host "====================================================" -ForegroundColor Cyan
    Write-Host " [1] Configurar Entorno (.env y Secretos)"
    Write-Host " [2] Configurar DNS Local (hosts)"
    Write-Host " [3] Gestionar Infraestructura (Vagrant/Swarm)"
    Write-Host " [4] Compilar Imágenes Docker (Build masivo)"
    Write-Host " [5] Ejecutar Pruebas JMeter (CLI + Reporte HTML)"
    Write-Host " [6] Sincronizar Ramas de Microservicios (GIT)"
    Write-Host " [7] Instalar Dependencias (pnpm/npm)"
    Write-Host " [8] Gestionar Entorno Local (Nativo/Host)"
    Write-Host " [9] Reparar Permisos de Ejecución (Unblock)"
    Write-Host " [0] Salir"
    Write-Host "----------------------------------------------------"
    $choice = Read-Host " Selecciona una opción"

    switch ($choice) {
        "1" {
            .\scripts\build-envs.ps1
            .\scripts\build-secrets.ps1
        }
        "2" {
            Start-Process powershell -Verb RunAs -ArgumentList "-File .\scripts\setup-hosts.ps1"
        }
        "3" {
            .\scripts\vagrant-manager.ps1
        }
        "4" {
            .\scripts\build-manager.ps1
        }
        "5" {
            .\scripts\vagrant-manager.ps1 -Option 7
        }
        "6" {
            Write-Host " [!] Iniciando Sincronización de Ramas..." -ForegroundColor Yellow
            git checkout dev
            $branches = @("frontend", "ms-auth-service", "ms-automotores", "ms-comparendos", "ms-infracciones", "ms-personas", "ms-reportes", "analytics-spark-service")
            foreach ($b in $branches) {
                Write-Host " --- Procesando $b ---" -ForegroundColor Gray
                git checkout -B $b dev
                $dir = if ($b -like "ms-*") { "backend/$b" } else { $b }
                git filter-branch --subdirectory-filter $dir --force
                git push origin $b --force
            }
            git checkout dev
            Write-Host " [✔] Repositorio sincronizado." -ForegroundColor Green
        }
        "7" {
            .\scripts\install-deps.ps1
        }
        "8" {
            .\scripts\local-manager.ps1
        }
        "9" {
            .\scripts\fix-permissions.ps1
        }
        "0" { exit }
        default { Write-Host " Opción inválida." -ForegroundColor Red }
    }
    Read-Host " Presiona Enter para continuar..."
    Show-Menu
}

Show-Menu
