# ==========================================
# SIMCOMP - CONFIGURACION MANUAL HOSTS
# ==========================================

Clear-Host

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "CONFIGURACION MANUAL DEL ARCHIVO HOSTS" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Abre esta ruta en el Explorador de Windows:" -ForegroundColor Green
Write-Host ""
Write-Host "   C:\Windows\System32\drivers\etc\" -ForegroundColor White
Write-Host ""

Write-Host "2. Abre el archivo 'hosts' con Bloc de notas COMO ADMINISTRADOR." -ForegroundColor Green
Write-Host ""

Write-Host "3. Pega el contenido que se ha copiado a tu portapapeles al final del archivo." -ForegroundColor Green
Write-Host ""

$HostsContent = @"

# ===== SIMCOMP INFRAESTRUCTURA =====
192.168.100.2 simcomp.co
192.168.100.2 www.simcomp.co
192.168.100.2 api.simcomp.co
192.168.100.2 stats.simcomp.co
192.168.100.2 monitor.simcomp.co
192.168.100.2 spark.simcomp.co
# ===================================
"@

Write-Host "Contenido a agregar:" -ForegroundColor Gray
Write-Host "------------------------------------------" -ForegroundColor Gray
Write-Host $HostsContent -ForegroundColor White
Write-Host "------------------------------------------" -ForegroundColor Gray

# Copiar al portapapeles
Set-Clipboard -Value $HostsContent

Write-Host ""
Write-Host "[OK] El contenido fue copiado al portapapeles automaticamente." -ForegroundColor Cyan
Write-Host "[INFO] Solo tienes que pegarlo en el archivo y guardar (CTRL + S)." -ForegroundColor Yellow
Write-Host ""

Pause