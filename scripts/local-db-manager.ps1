# local-db-manager.ps1 - Gesti  n de bases de datos locales (Corregido para multi-compose)
# =============================================================================

$BASE_DIR = "$PSScriptRoot\.."
$BACKEND_DIR = "$BASE_DIR\backend"

$DB_MAP = @{
    "ms-auth-service"  = "db-ms-auth-service"
    "ms-personas"      = "db-ms-personas"
    "ms-automotores"   = "db-ms-automotores"
    "ms-infracciones"  = "db-ms-infracciones"
    "ms-comparendos"   = "db-ms-comparendos"
}

function Log-Message {
    param([string]$message, [string]$color = "Cyan")
    Write-Host "[*] $message" -ForegroundColor $color
}

$ENGINE = if (Get-Command "podman" -ErrorAction SilentlyContinue) { "podman" } else { "docker" }

function Manage-DB {
    param($action, $target)

    foreach ($dir in $DB_MAP.Keys) {
        $serviceName = $DB_MAP[$dir]

        if ($target -ne "all" -and $target -ne $dir -and $target -ne $serviceName) {
            continue
        }

        $fullPath = Join-Path $BACKEND_DIR $dir
        if (Test-Path $fullPath) {
            Log-Message "Ejecutando $action para $serviceName en $dir..."
            Push-Location $fullPath

            switch ($action) {
                "start" {
                    & $ENGINE compose up -d $serviceName
                }
                "stop" {
                    & $ENGINE compose stop $serviceName
                }
                "restart" {
                    & $ENGINE compose restart $serviceName
                }
                "reset" {
                    & $ENGINE compose down $serviceName -v
                    & $ENGINE compose up -d $serviceName
                }
                "purge" {
                    & $ENGINE compose down -v
                }
                "status" {
                    & $ENGINE compose ps $serviceName
                }
            }

            Pop-Location
        }
    }
}

$action = if ($args[0]) { $args[0] } else { "status" }
$target = if ($args[1]) { $args[1] } else { "all" }

Manage-DB $action $target
