# scripts\setup-vbox-network.ps1
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "   CONFIGURACION DE RED VIRTUALBOX (192.168.100.x)" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

$vboxPath = "${env:ProgramFiles}\Oracle\VirtualBox\VBoxManage.exe"
if (-not (Test-Path $vboxPath)) {
    Write-Host "[!] VBoxManage no encontrado en la ruta por defecto." -ForegroundColor Yellow
    $vboxPath = "VBoxManage.exe" # Intentar por PATH
}

Write-Host "[*] Verificando adaptadores Host-Only..." -ForegroundColor Yellow

# Intentar encontrar el adaptador que tiene la IP 192.168.100.1
$adapters = Get-NetIPAddress | Where-Object { $_.IPAddress -eq "192.168.100.1" }

if ($adapters) {
    Write-Host "[OK] Se encontro un adaptador configurado en 192.168.100.1" -ForegroundColor Green
} else {
    Write-Host "[!] No se encontro el adaptador con la IP 192.168.100.1" -ForegroundColor Red
    Write-Host "[*] Intentando configurar el adaptador VirtualBox..." -ForegroundColor Yellow
    
    # Buscamos adaptadores de VirtualBox
    $vboxAdapter = Get-NetAdapter | Where-Object { $_.InterfaceDescription -like "*VirtualBox Host-Only*" } | Select-Object -First 1
    
    if ($vboxAdapter) {
        Write-Host "[*] Configurando $($vboxAdapter.Name) con IP 192.168.100.1..." -ForegroundColor Yellow
        $cmd = "netsh interface ip set address name=`"$($vboxAdapter.Name)`" static 192.168.100.1 255.255.255.0"
        Start-Process cmd -Verb RunAs -ArgumentList "/c $cmd" -Wait
        Write-Host "[OK] IP configurada exitosamente." -ForegroundColor Green
    } else {
        Write-Host "[ERROR] No se detecto ningun adaptador de VirtualBox instalado." -ForegroundColor Red
        Write-Host "Asegurate de haber instalado VirtualBox correctamente." -ForegroundColor White
    }
}

Write-Host "====================================================" -ForegroundColor Cyan
Pause
