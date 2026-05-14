# scripts\install-vagrant.ps1
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "       INSTALACION DE HASHICORP VAGRANT" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "[*] Buscando e instalando Vagrant via Winget..." -ForegroundColor Yellow
winget install Hashicorp.Vagrant --accept-package-agreements --accept-source-agreements
Write-Host "====================================================" -ForegroundColor Green
Write-Host "[OK] Proceso finalizado. DEBES REINICIAR el equipo" -ForegroundColor Green
Write-Host "para que Vagrant funcione correctamente." -ForegroundColor White
Write-Host "====================================================" -ForegroundColor Green
