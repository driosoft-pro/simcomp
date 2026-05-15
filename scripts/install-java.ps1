# scripts\install-java.ps1
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "       INSTALACION DE JAVA (OPENJDK 17)" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "[*] Buscando e instalando Microsoft OpenJDK 17 via Winget..." -ForegroundColor Yellow
winget install Microsoft.OpenJDK.17 --accept-package-agreements --accept-source-agreements
Write-Host "====================================================" -ForegroundColor Green
Write-Host "[OK] Proceso finalizado. REINICIA la terminal para usar 'java'." -ForegroundColor White
Write-Host "====================================================" -ForegroundColor Green
