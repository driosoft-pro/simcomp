# SIMCOMP - GESTOR CENTRAL DE INFRAESTRUCTURA (WINDOWS)

# Función de limpieza profunda para evitar texto sobrepuesto
function Clear-Screen {
    # Pequeña pausa para asegurar que el buffer de salida se complete
    Start-Sleep -Milliseconds 50
    # Limpieza estándar de PowerShell
    Clear-Host
    # Limpieza profunda del buffer del sistema (si está disponible)
    try { [System.Console]::Clear() } catch {}
    # Códigos de escape ANSI (Fuerza limpieza en terminales modernos como VS Code/Windows Terminal)
    Write-Host -NoNewline "$([char]27)[2J$([char]27)[H"
}

function Show-Menu {
    while ($true) {
        Clear-Screen
        Write-Host "====================================================" -ForegroundColor Cyan
        Write-Host "       SIMCOMP - PANEL DE CONTROL CENTRAL" -ForegroundColor Cyan
        Write-Host "====================================================" -ForegroundColor Cyan
        
        Write-Host " CONFIGURACION Y PREPARACION:" -ForegroundColor Yellow
        Write-Host "  [1] Configurar Entorno (.env y Secretos)"
        Write-Host "  [2] Configurar DNS Local (hosts)"
        Write-Host "  [3] Instalar Dependencias del Proyecto (pnpm/npm)"
        Write-Host "  [4] Instalar Node.js (npm)"
        Write-Host "  [5] Instalar Python 3"
        Write-Host "  [6] Instalar Java (OpenJDK 17)"
        Write-Host "  [7] Instalar Apache JMeter"
        Write-Host "  [8] Instalar HashiCorp Vagrant"
        Write-Host "  [9] Instalar Oracle VirtualBox"
        Write-Host "  [10] Configurar Red VirtualBox (Host-Only)"
        
        Write-Host " INFRAESTRUCTURA Y DESPLIEGUE:" -ForegroundColor Yellow
        Write-Host "  [11] Gestionar Swarm/Vagrant (Cluster)"
        Write-Host "  [12] Gestionar Entorno Local (Docker Full)"
        Write-Host "  [13] Gestionar Entorno Local (Nativo)"
        Write-Host "  [14] Compilar Imagenes Docker (Build)"

        Write-Host " PRUEBAS Y CALIDAD:" -ForegroundColor Yellow
        Write-Host "  [15] Ejecutar Pruebas JMeter (Load Testing)"

        Write-Host " MANTENIMIENTO:" -ForegroundColor Yellow
        Write-Host "  [17] Reparar Permisos de Ejecucion (Unblock)"
        Write-Host "  [18] Sanatizar Codificacion de Archivos"
        
        Write-Host "----------------------------------------------------" -ForegroundColor Cyan
        Write-Host "  [q] Salir"
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
            "17" {
                .\scripts\fix-permissions.ps1
            }
            "18" {
                .\scripts\sanitize-scripts.ps1
            }
            "q" { exit }
            default { Write-Host " Opcion invalida." -ForegroundColor Red }
        }
        
        if ($choice -match '^([4-9]|10)$') {
            Write-Host ""
            Write-Host " [!] AVISO DE REINICIO:" -ForegroundColor Yellow
            Write-Host " Algunos de los componentes instalados pueden requerir un reinicio para aplicarse correctamente." -ForegroundColor Cyan
            Write-Host " Se recomienda reiniciar el sistema tras finalizar todas las instalaciones." -ForegroundColor White
            Write-Host ""
        }

        if ($choice -ne "q") {
            Read-Host " Presiona Enter para continuar..."
        }
    }
}

Show-Menu
