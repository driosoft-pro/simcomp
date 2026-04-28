<#
.SYNOPSIS
Script para gestionar e inicializar entornos Vagrant de forma limpia.
#>

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location -Path (Join-Path $scriptPath "..")

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "  SIMCOMP - Gestor de Entornos Vagrant" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "Seleccione el entorno que desea desplegar:"
Write-Host "1) Vagrantfile_native (VMs tradicionales + Ansible)"
Write-Host "2) Vagrantfile_docker_swarm (Cluster Swarm de 3 Nodos)"
Write-Host "3) Vagrantfile_docker_swarm_spark (Cluster Swarm + Spark)"
Write-Host "4) Salir"
Write-Host ""

$opcion = Read-Host "Opción (1-4)"

$archivo = ""
switch ($opcion) {
    "1" { $archivo = "vagrantfiles/Vagrantfile_native" }
    "2" { $archivo = "vagrantfiles/Vagrantfile_docker_swarm" }
    "3" { $archivo = "vagrantfiles/Vagrantfile_docker_swarm_spark" }
    "4" { Write-Host "Saliendo..."; exit }
    default { Write-Host "Opción inválida." -ForegroundColor Red; exit }
}

Write-Host "=========================================================" -ForegroundColor Yellow
Write-Host "Atención: Esto destruirá cualquier máquina Vagrant existente en este proyecto." -ForegroundColor Yellow
$confirmar = Read-Host "¿Desea continuar y realizar una limpieza completa? (s/N)"

if ($confirmar -notmatch "^[sS]$") {
    Write-Host "Operación cancelada." -ForegroundColor Yellow
    exit
}

Write-Host "[*] Destruyendo máquinas existentes..." -ForegroundColor Green
if (Test-Path "Vagrantfile") {
    vagrant destroy -f
}

Write-Host "[*] Iniciando limpieza profunda de rastro de Vagrant..." -ForegroundColor Yellow
if (Test-Path ".vagrant") {
    # El flag -Force y -ErrorAction SilentlyContinue aseguran que no se detenga por bloqueos
    Remove-Item -Path ".vagrant" -Recurse -Force -ErrorAction SilentlyContinue
    if (Test-Path ".vagrant") {
        Write-Host "  --> Intentando borrado alternativo de .vagrant..." -ForegroundColor Gray
        cmd /c "rmdir /s /q .vagrant" 2>$null
    }
}
# Borrar archivos temporales de tokens y estados de Swarm
if (Test-Path "provisioning_docker/.swarm-token") { Remove-Item "provisioning_docker/.swarm-token" -Force }
if (Test-Path "provisioning_docker/.swarm-manager-ip") { Remove-Item "provisioning_docker/.swarm-manager-ip" -Force }
Write-Host "[✔] Limpieza de directorio .vagrant completada." -ForegroundColor Green

Write-Host "[*] Copiando $archivo a Vagrantfile..." -ForegroundColor Green
Copy-Item -Path $archivo -Destination "Vagrantfile" -Force

Write-Host "=========================================================" -ForegroundColor Cyan

if ($opcion -eq "1") {
    Write-Host "Iniciando entorno Nativo (Vagrant + Ansible)..." -ForegroundColor Green
    vagrant up
} else {
    Write-Host "Iniciando máquinas virtuales (Worker1 -> Worker2 -> Manager)..." -ForegroundColor Green
    vagrant up workerDocker1 --no-provision
    vagrant up workerDocker2 --no-provision
    vagrant up managerDocker --no-provision

    Write-Host "`n[*] Inicializando Docker Swarm en el Manager..." -ForegroundColor Green
    vagrant provision managerDocker --provision-with fix-dns,docker-install,swarm-init

    Write-Host "`n[*] Uniendo Worker 1 al Swarm..." -ForegroundColor Green
    vagrant provision workerDocker1

    Write-Host "`n[*] Uniendo Worker 2 al Swarm..." -ForegroundColor Green
    vagrant provision workerDocker2

    Write-Host "`n[*] Desplegando el Stack de la aplicación en el Manager..." -ForegroundColor Green
    vagrant provision managerDocker --provision-with deploy-stack
    
    Write-Host "=========================================================" -ForegroundColor Cyan
    Write-Host "¡Despliegue de Docker Swarm completado con éxito!" -ForegroundColor Green
}
