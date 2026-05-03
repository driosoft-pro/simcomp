# fix-permissions.ps1 - Repara bloqueos de archivos en Windows
# =============================================================================

Write-Host "[*] Desbloqueando archivos de script (.ps1)..." -ForegroundColor Cyan

# Desbloquear archivos en la raíz
Get-ChildItem -Path "$PSScriptRoot\..\*.ps1" | Unblock-File

# Desbloquear archivos en /scripts
Get-ChildItem -Path "$PSScriptRoot\*.ps1" | Unblock-File

Write-Host "[✔] Archivos desbloqueados. Si tienes problemas de ejecución, corre: Set-ExecutionPolicy Bypass -Scope Process" -ForegroundColor Green
