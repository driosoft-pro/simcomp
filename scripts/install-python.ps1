# scripts\install-python.ps1
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "       INSTALACION DE PYTHON 3" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "[*] Buscando e instalando Python 3 via Winget..." -ForegroundColor Yellow
winget install Python.Python.3 --accept-package-agreements --accept-source-agreements
Write-Host "====================================================" -ForegroundColor Green
Write-Host "[OK] Proceso finalizado. REINICIA la terminal para usar 'python'." -ForegroundColor White
Write-Host "====================================================" -ForegroundColor Green
