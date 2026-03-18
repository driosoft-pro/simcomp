$ErrorActionPreference = "Stop"

$BASE_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$BACKEND_DIR = Join-Path $BASE_DIR "backend"

$DB_CONTAINERS = @(
  "db-ms-auth-service",
  "db-ms-comparendos",
  "db-ms-automotores",
  "db-ms-infracciones",
  "db-ms-personas"
)

$DB_VOLUMES = @(
  "ms-auth-service_auth_db_data",
  "ms-comparendos_comparendos_data",
  "ms-automotores_automotores_db_data",
  "ms-infracciones_infracciones_db_data",
  "ms-personas_personas_db_data"
)

$MICROSERVICES = @(
  "ms-auth-service",
  "ms-personas",
  "ms-automotores",
  "ms-infracciones",
  "ms-comparendos"
)

function Log($msg) {
  Write-Host "`n[INFO] $msg" -ForegroundColor Blue
}

function Ok($msg) {
  Write-Host "[OK] $msg" -ForegroundColor Green
}

function Warn($msg) {
  Write-Host "[WARN] $msg" -ForegroundColor Yellow
}

function Err($msg) {
  Write-Host "[ERROR] $msg" -ForegroundColor Red
}

function Check-Podman {
  try {
    podman --version | Out-Null
  } catch {
    Err "podman no está instalado o no está en el PATH."
    exit 1
  }
}

function Test-ContainerExists($name) {
  $result = podman container exists $name 2>$null
  return ($LASTEXITCODE -eq 0)
}

function Test-VolumeExists($name) {
  $result = podman volume exists $name 2>$null
  return ($LASTEXITCODE -eq 0)
}

function Find-ComposeFile($serviceDir) {
  $files = @("docker-compose.yml", "docker-compose.yaml", "compose.yml", "compose.yaml")
  foreach ($f in $files) {
    $fullPath = Join-Path $serviceDir $f
    if (Test-Path $fullPath) {
      return $f
    }
  }
  return $null
}

function Stop-And-Remove-DbContainers {
  Log "Deteniendo contenedores de bases de datos..."
  foreach ($c in $DB_CONTAINERS) {
    if (Test-ContainerExists $c) {
      try {
        podman stop $c | Out-Null
        Ok "Contenedor detenido: $c"
      } catch {
        Warn "No se pudo detener $c, se continúa."
      }
    } else {
      Warn "No existe el contenedor: $c"
    }
  }

  Log "Eliminando contenedores de bases de datos..."
  foreach ($c in $DB_CONTAINERS) {
    if (Test-ContainerExists $c) {
      try {
        podman rm -f $c | Out-Null
        Ok "Contenedor eliminado: $c"
      } catch {
        Warn "No se pudo eliminar $c, se continúa."
      }
    } else {
      Warn "Ya no existe el contenedor: $c"
    }
  }
}

function Remove-DbVolumes {
  Log "Eliminando volúmenes de PostgreSQL..."
  foreach ($v in $DB_VOLUMES) {
    if (Test-VolumeExists $v) {
      try {
        podman volume rm -f $v | Out-Null
        Ok "Volumen eliminado: $v"
      } catch {
        Warn "No se pudo eliminar el volumen $v, se continúa."
      }
    } else {
      Warn "No existe el volumen: $v"
    }
  }
}

function Rebuild-Microservice($service) {
  $serviceDir = Join-Path $BACKEND_DIR $service

  if (-not (Test-Path $serviceDir)) {
    Warn "No existe el directorio $serviceDir, se omite."
    return
  }

  $composeFile = Find-ComposeFile $serviceDir
  if (-not $composeFile) {
    Warn "No se encontró compose en $serviceDir, se omite."
    return
  }

  Log "Recreando $service desde $serviceDir..."
  Push-Location $serviceDir
  try {
    podman compose -f $composeFile up -d --build --force-recreate
    Ok "$service levantado."
  } catch {
    Err "Falló al levantar $service"
  } finally {
    Pop-Location
  }
}

function Status-All {
  Log "Contenedores activos:"
  try {
    podman ps
  } catch {
    Warn "No se pudo listar contenedores."
  }

  Log "Volúmenes actuales:"
  try {
    podman volume ls
  } catch {
    Warn "No se pudo listar volúmenes."
  }
}

function Reset-All {
  Stop-And-Remove-DbContainers
  Remove-DbVolumes

  foreach ($service in $MICROSERVICES) {
    Rebuild-Microservice $service
  }

  Status-All
}

$action = if ($args.Count -gt 0) { $args[0] } else { "reset" }

switch ($action) {
  "reset" {
    Check-Podman
    Reset-All
  }
  "status" {
    Check-Podman
    Status-All
  }
  default {
    Write-Host "Uso: .\reset-dbs.ps1 [reset|status]" -ForegroundColor White
    exit 1
  }
}