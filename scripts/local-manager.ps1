# local-manager.ps1 - Sub-men  para gesti n local nativa (Windows)
# =============================================================================

# Funci n de limpieza profunda para evitar texto sobrepuesto
function Clear-Screen {
    # Peque a pausa para asegurar que el buffer de salida se complete
    Start-Sleep -Milliseconds 50
    # Limpieza est ndar de PowerShell
    Clear-Host
    # Limpieza profunda del buffer del sistema (si est  disponible)
    try { [System.Console]::Clear() } catch {}
    # C digos de escape ANSI (Fuerza limpieza en terminales modernos como VS Code/Windows Terminal)
    Write-Host -NoNewline "$([char]27)[2J$([char]27)[H"
}

function Show-LocalMenu {
    while ($true) {
        Clear-Screen
        Write-Host "====================================================" -ForegroundColor Blue
        Write-Host "       SIMCOMP - GESTI N ENTORNO LOCAL (NATIVO)" -ForegroundColor Blue
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
        Write-Host "  [q] Regresar al Men  Principal"
        Write-Host "----------------------------------------------------" -ForegroundColor Blue
        
        $lopt = Read-Host " Selecciona una opcion"

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
            "q" { return }
            default { Write-Host " Opci n invalida." -ForegroundColor Red }
        }
        Read-Host " Presiona Enter para continuar..."
    }
}

function Show-IndividualMenu {
    Write-Host "`n--- Gesti n Individual ---" -ForegroundColor Yellow
    Write-Host "Servicios: ms-auth-service, ms-personas, ms-automotores, ms-infracciones, ms-comparendos, ms-reportes"
    $sname = Read-Host "Nombre del servicio (o Enter para cancelar)"
    
    if ([string]::IsNullOrWhiteSpace($sname)) {
        return
    }

    Write-Host "  [1] Iniciar"
    Write-Host "  [2] Detener"
    Write-Host "  [3] Reset DB"
    Write-Host "  [q] Cancelar"
    $sact = Read-Host "Acci n"
    
    switch ($sact) {
        "1" { .\scripts\local-ms-manager.ps1 start $sname }
        "2" { .\scripts\local-ms-manager.ps1 stop $sname }
        "3" { 
            $dbName = "db-" + $sname.Replace("ms-", "")
            .\scripts\local-db-manager.ps1 reset $dbName 
        }
        "q" { Write-Host "Acci n cancelada." }
        Default { Write-Host "Acci n cancelada." }
    }
}

Show-LocalMenu
