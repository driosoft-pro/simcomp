# SIMCOMP - GESTOR CENTRAL DE INFRAESTRUCTURA (WINDOWS)

function Show-Menu {
    Clear-Host
    Write-Host "====================================================" -ForegroundColor Cyan
    Write-Host "       SIMCOMP - PANEL DE CONTROL CENTRAL" -ForegroundColor Cyan
    Write-Host "====================================================" -ForegroundColor Cyan
    
    Write-Host " CONFIGURACION Y PREPARACION:" -ForegroundColor Yellow
    Write-Host "  [1] Configurar Entorno (.env y Secretos)"
    Write-Host "  [2] Configurar DNS Local (hosts)"
    Write-Host "  [3] Instalar Dependencias del Proyecto (pnpm/npm)"
    Write-Host "  [4] Instalar Node.js (npm)" -ForegroundColor Cyan
    Write-Host "  [5] Instalar Python 3" -ForegroundColor Cyan
    Write-Host "  [6] Instalar Java (OpenJDK 17)" -ForegroundColor Cyan
    Write-Host "  [7] Instalar Apache JMeter" -ForegroundColor Cyan
    Write-Host "  [8] Instalar HashiCorp Vagrant" -ForegroundColor Cyan
    Write-Host "  [9] Instalar Oracle VirtualBox" -ForegroundColor Cyan
    Write-Host "  [10] Configurar Red VirtualBox (Host-Only)" -ForegroundColor Cyan
    
    Write-Host " INFRAESTRUCTURA Y DESPLIEGUE:" -ForegroundColor Yellow
    Write-Host "  [11] Gestionar Swarm/Vagrant (Cluster)"
    Write-Host "  [12] Gestionar Entorno Local (Docker Full)"
    Write-Host "  [13] Gestionar Entorno Local (Nativo)"
    Write-Host "  [14] Compilar Imagenes Docker (Build)"

    Write-Host " PRUEBAS Y CALIDAD:" -ForegroundColor Yellow
    Write-Host "  [15] Ejecutar Pruebas JMeter (Load Testing)"
    Write-Host "  [16] Sincronizar Ramas Microservicios (Git)"

    Write-Host " MANTENIMIENTO:" -ForegroundColor Yellow
    Write-Host "  [17] Reparar Permisos de Ejecucion (Unblock)"
    Write-Host "  [18] Sanatizar Codificacion de Archivos" -ForegroundColor Cyan
    
    Write-Host "----------------------------------------------------" -ForegroundColor Cyan
    Write-Host "  [0] Salir"
    Write-Host "----------------------------------------------------" -ForegroundColor Cyan
    $choice = Read-Host " Selecciona una opcion"

    switch ($choice) {
        "1" {
            .\scripts\build-envs.ps1
            .\scripts\build-secrets.ps1
        }
        "2" {
            .\scripts\setup-hosts.ps1
        }
        "3" {
            .\scripts\install-deps.ps1
        }
        "4" {
            .\scripts\install-node.ps1
        }
        "5" {
            .\scripts\install-python.ps1
        }
        "6" {
            .\scripts\install-java.ps1
        }
        "7" {
            .\scripts\install-jmeter.ps1
        }
        "8" {
            .\scripts\install-vagrant.ps1
        }
        "9" {
            .\scripts\install-virtualbox.ps1
        }
        "10" {
            .\scripts\setup-vbox-network.ps1
        }
        "11" {
            .\scripts\vagrant-manager.ps1
        }
        "12" {
            .\scripts\local-docker-manager.ps1
        }
        "13" {
            .\scripts\local-manager.ps1
        }
        "14" {
            .\scripts\build-manager.ps1
        }
        "15" {
            .\scripts\vagrant-manager.ps1 -Option 7
        }
        "16" {
            Write-Host " [!] Iniciando Sincronizacion de Ramas..." -ForegroundColor Yellow
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
            Write-Host " [OK] Repositorio sincronizado." -ForegroundColor Green
        }
        "17" {
            .\scripts\fix-permissions.ps1
        }
        "18" {
            .\scripts\sanitize-scripts.ps1
        }
        "0" { exit }
        default { Write-Host " Opcion invalida." -ForegroundColor Red }
    }
    
    if ($choice -match '^([4-9]|10)$') {
        Write-Host ""
        Write-Host " [!] AVISO DE REINICIO:" -ForegroundColor Yellow
        Write-Host " Algunos de los componentes instalados pueden requerir un reinicio para aplicarse correctamente." -ForegroundColor Cyan
        Write-Host " Se recomienda reiniciar el sistema tras finalizar todas las instalaciones." -ForegroundColor White
        Write-Host ""
    }

    Read-Host " Presiona Enter para continuar..."
    Show-Menu
}

Show-Menu
