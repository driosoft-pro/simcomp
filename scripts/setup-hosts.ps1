# SIMCOMP - Configurador de DNS Local (Windows)
# Requiere ejecutar como Administrador

$HostsPath = "C:\Windows\System32\drivers\etc\hosts"
$IpManager = "192.168.100.2"
$Domains = "simcomp.co www.simcomp.co api.simcomp.co stats.simcomp.co monitor.simcomp.co spark.simcomp.co"
$Entry = "$IpManager $Domains"

$AdminStatus = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $AdminStatus) {
    Write-Host " [!] ERROR: Debes ejecutar este script como Administrador." -ForegroundColor Red
    exit
}

$Content = Get-Content $HostsPath
if ($Content -match "simcomp.co") {
    Write-Host " [!] El dominio simcomp.co ya existe. Limpiando entrada previa..." -ForegroundColor Yellow
    $NewContent = $Content | Where-Object { $_ -notmatch "simcomp.co" }
    $NewContent | Set-Content $HostsPath -Encoding ASCII
}

Add-Content -Path $HostsPath -Value "`n$Entry" -Encoding ASCII
Write-Host " [✔] Archivo hosts de Windows actualizado correctamente." -ForegroundColor Green
