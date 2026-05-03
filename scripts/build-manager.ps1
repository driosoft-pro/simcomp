# build-manager.ps1 - Sub-menú para construcción y subida de imágenes (Windows)
# =============================================================================

function Show-BuildMenu {
    Clear-Host
    Write-Host "====================================================" -ForegroundColor Blue
    Write-Host "       SIMCOMP - GESTIÓN DE IMÁGENES DOCKER" -ForegroundColor Blue
    Write-Host "====================================================" -ForegroundColor Blue
    Write-Host "  [1] Solo Construir (Build Local)"
    Write-Host "  [2] Solo Subir (Push a Docker Hub)"
    Write-Host "  [3] Todo (Login + Build + Push)"
    Write-Host "  [4] Construir/Subir un servicio específico"
    Write-Host "----------------------------------------------------" -ForegroundColor Blue
    Write-Host "  [0] Regresar al Menú Principal"
    Write-Host "----------------------------------------------------" -ForegroundColor Blue
    $bopt = Read-Host " Selecciona una opción"

    switch ($bopt) {
        "1" { .\scripts\build-and-push-dockerhub.ps1 -Action build }
        "2" { .\scripts\build-and-push-dockerhub.ps1 -Action push }
        "3" { .\scripts\build-and-push-dockerhub.ps1 -Action all }
        "4" {
            $sname = Read-Host "Nombre del servicio (ej: simcomp-auth-service)"
            $sact = Read-Host "Acción (build/push/all)"
            .\scripts\build-and-push-dockerhub.ps1 -Action $sact -Service $sname
        }
        "0" { return }
        default { Write-Host " Opción inválida." -ForegroundColor Red }
    }
    Read-Host " Presiona Enter para continuar..."
    Show-BuildMenu
}

Show-BuildMenu
