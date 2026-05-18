# build-manager.ps1 - Sub-men   para construcci  n y subida de im  genes (Windows)
# =============================================================================

function Show-BuildMenu {
    Clear-Host
    Write-Host "====================================================" -ForegroundColor Blue
    Write-Host "       SIMCOMP - GESTI  N DE IM  GENES DOCKER" -ForegroundColor Blue
    Write-Host "====================================================" -ForegroundColor Blue
    Write-Host "  [1] Solo Construir (Build Local)"
    Write-Host "  [2] Solo Subir (Push a Docker Hub)"
    Write-Host "  [3] Todo (Login + Build + Push)"
    Write-Host "  [4] Construir/Subir un servicio espec  fico"
    Write-Host "----------------------------------------------------" -ForegroundColor Blue
    Write-Host "  [q] Regresar al Men  Principal"
    Write-Host "----------------------------------------------------" -ForegroundColor Blue
    $bopt = Read-Host " Selecciona una opcion"

    switch ($bopt) {
        "1" { .\scripts\build-and-push-dockerhub.ps1 -Action build }
        "2" { .\scripts\build-and-push-dockerhub.ps1 -Action push }
        "3" { .\scripts\build-and-push-dockerhub.ps1 -Action all }
        "4" {
            $sname = Read-Host "Nombre del servicio (ej: simcomp-auth-service)"
            $sact = Read-Host "Acci n (build/push/all)"
            .\scripts\build-and-push-dockerhub.ps1 -Action $sact -Service $sname
        }
        "q" { return }
        default { Write-Host " Opci  n invalida." -ForegroundColor Red }
    }
    Read-Host " Presiona Enter para continuar..."
    Show-BuildMenu
}

Show-BuildMenu
