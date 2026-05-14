#Requires -Version 5.1
<#
.SYNOPSIS
    Resetea las bases de datos de los microservicios (podman / docker).

.DESCRIPTION
    Detiene y elimina los contenedores de BD, borra sus vol  menes y
    reconstruye todos los microservicios desde sus archivos compose.

.PARAMETER Action
    reset      (predeterminado) Reinicia todo.
    status     Muestra contenedores y vol  menes activos.

.PARAMETER Engine
    Fuerza el uso de un motor espec  fico: 'podman' o 'docker'.
    Si no se indica, el script detecta autom  ticamente.

.EXAMPLE
    .\reset-dbs.ps1
    .\reset-dbs.ps1 -Action status
    .\reset-dbs.ps1 -Action reset -Engine docker
#>

param(
    [ValidateSet("reset", "status")]
    [string]$Action = "reset",

    [ValidateSet("", "podman", "docker")]
    [string]$Engine = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

#           Configuration                                                                                                                                                                                     

$BaseDir    = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = $BaseDir

$DbContainers = @(
    "db-ms-auth-service",
    "db-ms-comparendos",
    "db-ms-automotores",
    "db-ms-infracciones",
    "db-ms-personas"
)

$DbVolumes = @(
    "ms-auth-service_auth_db_data",
    "ms-comparendos_comparendos_db_data",
    "ms-automotores_automotores_db_data",
    "ms-infracciones_infracciones_db_data",
    "ms-personas_personas_db_data"
)

$Microservices = @(
    "ms-auth-service",
    "ms-personas",
    "ms-automotores",
    "ms-infracciones",
    "ms-comparendos"
)

#           Logging helpers                                                                                                                                                                               

function Write-Log  { param([string]$Msg) Write-Host "`n[INFO]  $Msg" -ForegroundColor Cyan }
function Write-Ok   { param([string]$Msg) Write-Host "[OK]    $Msg" -ForegroundColor Green }
function Write-Warn { param([string]$Msg) Write-Host "[WARN]  $Msg" -ForegroundColor Yellow }
function Write-Err  { param([string]$Msg) Write-Host "[ERROR] $Msg" -ForegroundColor Red }

#           Engine detection                                                                                                                                                                            

$ContainerEngine = ""
$UseDockerComposePlugin = $false

function Detect-Engine {
    if ($Engine -ne "") {
        if (-not (Get-Command $Engine -ErrorAction SilentlyContinue)) {
            Write-Err "El motor especificado '$Engine' no esta disponible en PATH."
            exit 1
        }

        $script:ContainerEngine = $Engine
    }
    elseif (Get-Command "podman" -ErrorAction SilentlyContinue) {
        $script:ContainerEngine = "podman"
    }
    elseif (Get-Command "docker" -ErrorAction SilentlyContinue) {
        $script:ContainerEngine = "docker"
    }
    else {
        Write-Err "No se encontr   podman ni docker instalado o en el PATH."
        exit 1
    }

    if ($script:ContainerEngine -eq "docker") {
        try {
            & docker compose version 1>$null 2>$null
            $script:UseDockerComposePlugin = ($LASTEXITCODE -eq 0)
        }
        catch {
            $script:UseDockerComposePlugin = $false
        }

        if (-not $script:UseDockerComposePlugin) {
            if (-not (Get-Command "docker-compose" -ErrorAction SilentlyContinue)) {
                Write-Err "No se encontr   'docker compose' ni 'docker-compose'."
                exit 1
            }
        }
    }

    Write-Ok "Motor de contenedores detectado: $($script:ContainerEngine)"
}

function Invoke-Compose {
    param(
        [string]$WorkDir,
        [string]$ComposeFile,
        [string[]]$ExtraArgs
    )

    Push-Location $WorkDir

    try {
        if ($ContainerEngine -eq "podman") {
            & podman compose -f $ComposeFile @ExtraArgs
        }
        elseif ($UseDockerComposePlugin) {
            & docker compose -f $ComposeFile @ExtraArgs
        }
        else {
            & docker-compose -f $ComposeFile @ExtraArgs
        }

        if ($LASTEXITCODE -ne 0) {
            throw "compose fall   con c  digo $LASTEXITCODE"
        }
    }
    finally {
        Pop-Location
    }
}

#           Helpers                                                                                                                                                                                                       

function Test-ContainerExists {
    param([string]$Name)

    try {
        & $ContainerEngine container inspect $Name 1>$null 2>$null
        return ($LASTEXITCODE -eq 0)
    }
    catch {
        return $false
    }
}

function Test-VolumeExists {
    param([string]$Name)

    try {
        & $ContainerEngine volume inspect $Name 1>$null 2>$null
        return ($LASTEXITCODE -eq 0)
    }
    catch {
        return $false
    }
}

function Find-ComposeFile {
    param([string]$ServiceDir)

    $candidates = @(
        "docker-compose.yml",
        "docker-compose.yaml",
        "compose.yml",
        "compose.yaml"
    )

    foreach ($f in $candidates) {
        $full = Join-Path $ServiceDir $f

        if (Test-Path $full) {
            return $f
        }
    }

    return $null
}

#           Core operations                                                                                                                                                                               

function Stop-And-Remove-DbContainers {
    Write-Log "Deteniendo contenedores de bases de datos..."

    foreach ($c in $DbContainers) {
        if (Test-ContainerExists $c) {
            try {
                & $ContainerEngine stop $c 1>$null 2>$null
                Write-Ok "Contenedor detenido: $c"
            }
            catch {
                Write-Warn "No se pudo detener el contenedor: $c"
            }
        }
        else {
            Write-Warn "No existe el contenedor: $c"
        }
    }

    Write-Log "Eliminando contenedores de bases de datos..."

    foreach ($c in $DbContainers) {
        if (Test-ContainerExists $c) {
            try {
                & $ContainerEngine rm -f $c 1>$null 2>$null
                Write-Ok "Contenedor eliminado: $c"
            }
            catch {
                Write-Warn "No se pudo eliminar el contenedor: $c"
            }
        }
        else {
            Write-Warn "Ya no existe el contenedor: $c"
        }
    }
}

function Remove-DbVolumes {
    Write-Log "Eliminando vol  menes de PostgreSQL..."

    foreach ($v in $DbVolumes) {
        if (Test-VolumeExists $v) {
            try {
                & $ContainerEngine volume rm -f $v 1>$null 2>$null
                Write-Ok "Volumen eliminado: $v"
            }
            catch {
                Write-Warn "No se pudo eliminar el volumen: $v"
            }
        }
        else {
            Write-Warn "No existe el volumen: $v"
        }
    }
}

function Rebuild-Microservice {
    param([string]$Service)

    $serviceDir = Join-Path $BackendDir $Service

    if (-not (Test-Path $serviceDir -PathType Container)) {
        Write-Warn "No existe el directorio $serviceDir, se omite."
        return
    }

    $composeFile = Find-ComposeFile $serviceDir

    if (-not $composeFile) {
        Write-Warn "No se encontr   archivo compose en $serviceDir, se omite."
        return
    }

    Write-Log "Recreando $Service desde $serviceDir..."

    Invoke-Compose `
        -WorkDir $serviceDir `
        -ComposeFile $composeFile `
        -ExtraArgs @("up", "-d", "--build", "--force-recreate")

    Write-Ok "$Service levantado."
}

function Show-Status {
    Write-Log "Contenedores activos:"
    & $ContainerEngine ps

    Write-Log "Vol  menes actuales:"
    & $ContainerEngine volume ls
}

function Reset-All {
    Stop-And-Remove-DbContainers
    Remove-DbVolumes

    foreach ($svc in $Microservices) {
        Rebuild-Microservice -Service $svc
    }

    Show-Status
}

#           Entry point                                                                                                                                                                                           

Detect-Engine

switch ($Action) {
    "reset"  { Reset-All }
    "status" { Show-Status }
}