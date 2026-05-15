# scripts\install-node.ps1
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "       INSTALACION DE NODE.JS (LTS)" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "[*] Buscando e instalando Node.js LTS via Winget..." -ForegroundColor Yellow
winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
Write-Host "====================================================" -ForegroundColor Green
Write-Host "[OK] Proceso finalizado. Si es la primera vez que lo instalas," -ForegroundColor Green
Write-Host "debes REINICIAR la terminal para que 'node' y 'npm' funcionen." -ForegroundColor White
Write-Host "====================================================" -ForegroundColor Green
