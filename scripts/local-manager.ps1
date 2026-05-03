# local-manager.ps1 - Sub-menú para gestión local nativa (Windows)
# =============================================================================

function Show-LocalMenu {
    Clear-Host
    Write-Host "====================================================" -ForegroundColor Blue
    Write-Host "       SIMCOMP - GESTIÓN ENTORNO LOCAL (NATIVO)" -ForegroundColor Blue
    Write-Host "====================================================" -ForegroundColor Blue
    Write-Host " BASES DE DATOS (DOCKER):" -ForegroundColor Yellow
    Write-Host "  [1] Iniciar Todas las DBs"
    Write-Host "  [2] Detener Todas las DBs"
    Write-Host "  [3] Resetear DBs (Borrar Datos y Recrear)"
    Write-Host "  [4] Limpiar/Purgar Todo (Docker Down -v)"
    Write-Host "  [5] Ver Estado DBs"
    Write-Host " MICROSERVICIOS (NODE.JS):" -ForegroundColor Yellow
    Write-Host "  [6] Iniciar Todos los Microservicios"
    Write-Host "  [7] Detener Todos los Microservicios"
    Write-Host "  [8] Gestionar Servicio Individual"
    Write-Host "  [9] Ver Estado Microservicios"
    Write-Host "----------------------------------------------------" -ForegroundColor Blue
    Write-Host "  [0] Regresar al Menú Principal"
    Write-Host "----------------------------------------------------" -ForegroundColor Blue
    $lopt = Read-Host " Selecciona una opción"

    switch ($lopt) {
        "1" { .\scripts\local-db-manager.ps1 start }
        "2" { .\scripts\local-db-manager.ps1 stop }
        "3" { .\scripts\local-db-manager.ps1 reset }
        "4" { .\scripts\local-db-manager.ps1 purge }
        "5" { .\scripts\local-db-manager.ps1 status }
        "6" { .\scripts\local-ms-manager.ps1 start }
        "7" { .\scripts\local-ms-manager.ps1 stop }
        "8" { Show-IndividualMenu }
        "9" { .\scripts\local-ms-manager.ps1 status }
        "0" { return }
        default { Write-Host " Opción inválida." -ForegroundColor Red }
    }
    Read-Host " Presiona Enter para continuar..."
    Show-LocalMenu
}

function Show-IndividualMenu {
    Write-Host "`n--- Gestión Individual ---" -ForegroundColor Yellow
    Write-Host "Servicios: ms-auth-service, ms-personas, ms-automotores, ms-infracciones, ms-comparendos, ms-reportes"
    $sname = Read-Host "Nombre del servicio (o Enter para cancelar)"
    
    if ([string]::IsNullOrWhiteSpace($sname)) {
        return
    }

    Write-Host "  [1] Iniciar"
    Write-Host "  [2] Detener"
    Write-Host "  [3] Reset DB"
    Write-Host "  [0] Cancelar"
    $sact = Read-Host "Acción"
    
    switch ($sact) {
        "1" { .\scripts\local-ms-manager.ps1 start $sname }
        "2" { .\scripts\local-ms-manager.ps1 stop $sname }
        "3" { 
            $dbName = "db-" + $sname.Replace("ms-", "")
            .\scripts\local-db-manager.ps1 reset $dbName 
        }
        Default { Write-Host "Acción cancelada." }
    }
}

Show-LocalMenu
