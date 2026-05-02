# Script para generar los archivos de secretos requeridos por Docker Swarm
# SIMCOMP - Auditoría de Producción

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "  SIMCOMP - Generador de Secretos (Docker Swarm)" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

# Moverse a la raíz del proyecto
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptPath\.."

$SECRETS_DIR = "provisioning_docker\secrets"
if (!(Test-Path $SECRETS_DIR)) {
    New-Item -ItemType Directory -Path $SECRETS_DIR | Out-Null
}

Write-Host "[+] Directorio de secretos: $SECRETS_DIR"

# Función para obtener un valor de un .env.swarm si existe, o usar un default
function Get-Val {
    param($file, $key, $default)
    if (Test-Path $file) {
        $line = Get-Content $file | Where-Object { $_ -match "^$key=" } | Select-Object -First 1
        if ($line) {
            return $line.Split('=', 2)[1]
        }
    }
    return $default
}

$SWARM_ENV = ".env.swarm"

Write-Host "[+] Generando archivos de secretos..."

# DB Passwords
(Get-Val $SWARM_ENV "AUTH_DB_PASSWORD" "auth_pass") | Out-File -FilePath "$SECRETS_DIR\auth_db_pass.txt" -NoNewline -Encoding utf8
(Get-Val $SWARM_ENV "PERSONAS_DB_PASSWORD" "personas_pass") | Out-File -FilePath "$SECRETS_DIR\personas_db_pass.txt" -NoNewline -Encoding utf8
(Get-Val $SWARM_ENV "AUTOMOTORES_DB_PASSWORD" "automotores_pass") | Out-File -FilePath "$SECRETS_DIR\automotores_db_pass.txt" -NoNewline -Encoding utf8
(Get-Val $SWARM_ENV "INFRACCIONES_DB_PASSWORD" "infracciones_pass") | Out-File -FilePath "$SECRETS_DIR\infracciones_db_pass.txt" -NoNewline -Encoding utf8
(Get-Val $SWARM_ENV "COMPARENDOS_DB_PASSWORD" "comparendos_pass") | Out-File -FilePath "$SECRETS_DIR\comparendos_db_pass.txt" -NoNewline -Encoding utf8

# JWT Secret
(Get-Val $SWARM_ENV "JWT_SECRET" "supersecretkey_auth_2026") | Out-File -FilePath "$SECRETS_DIR\jwt_secret.txt" -NoNewline -Encoding utf8

Write-Host "    -> Creado: auth_db_pass.txt"
Write-Host "    -> Creado: personas_db_pass.txt"
Write-Host "    -> Creado: automotores_db_pass.txt"
Write-Host "    -> Creado: infracciones_db_pass.txt"
Write-Host "    -> Creado: comparendos_db_pass.txt"
Write-Host "    -> Creado: jwt_secret.txt"

Write-Host ""
Write-Host "¡Secretos generados con éxito!" -ForegroundColor Green
Write-Host "Ahora puedes ejecutar: vagrant provision managerDocker --provision-with deploy-stack"
Write-Host "=========================================================" -ForegroundColor Cyan
