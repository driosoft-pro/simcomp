# scripts\install-virtualbox.ps1
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "       INSTALACION DE ORACLE VIRTUALBOX" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "[*] Buscando e instalando VirtualBox via Winget..." -ForegroundColor Yellow
winget install Oracle.VirtualBox --accept-package-agreements --accept-source-agreements
Write-Host "====================================================" -ForegroundColor Green
Write-Host "[OK] Proceso finalizado. Es recomendable REINICIAR" -ForegroundColor Green
Write-Host "el equipo despues de la instalacion de VirtualBox." -ForegroundColor White
Write-Host "====================================================" -ForegroundColor Green
