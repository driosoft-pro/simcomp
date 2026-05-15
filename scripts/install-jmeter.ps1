# scripts\install-jmeter.ps1 - Instalador automatico de Apache JMeter para Windows
# =============================================================================

$jmeterVersion = "5.6.3"
$jmeterZipUrl = "https://archive.apache.org/dist/jmeter/binaries/apache-jmeter-$jmeterVersion.zip"
$installRoot = "C:\jmeter"
$jmeterPath = "$installRoot\apache-jmeter-$jmeterVersion"
$binPath = "$jmeterPath\bin"

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "       INSTALACION DE APACHE JMETER" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Verificar Java
Write-Host "[*] Verificando Requisito: Java (JRE/JDK)..." -ForegroundColor Yellow
if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
    Write-Host "[X] No se encontro Java instalado." -ForegroundColor Red
    Write-Host "    Por favor, instala OpenJDK 17 o superior antes de continuar." -ForegroundColor White
    Write-Host "    Descarga: https://adoptium.net/" -ForegroundColor Blue
    return
}
Write-Host "[OK] Java detectado." -ForegroundColor Green

# 2. Preparar Directorio
if (-not (Test-Path $installRoot)) {
    Write-Host "[*] Creando directorio $installRoot..." -ForegroundColor Yellow
    try {
        New-Item -Path $installRoot -ItemType Directory -Force -ErrorAction Stop | Out-Null
    } catch {
        Write-Host "[X] No se pudo crear el directorio $installRoot. Intenta ejecutar como Administrador." -ForegroundColor Red
        return
    }
}

if (Test-Path "$binPath\jmeter.bat") {
    Write-Host "[OK] JMeter ya parece estar instalado en $jmeterPath." -ForegroundColor Green
} else {
    # 3. Descargar JMeter
    $zipFile = "$installRoot\jmeter.zip"
    Write-Host "[*] Descargando Apache JMeter $jmeterVersion..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri $jmeterZipUrl -OutFile $zipFile -ErrorAction Stop
    } catch {
        Write-Host "[X] Error al descargar JMeter. Verifica tu conexion." -ForegroundColor Red
        return
    }
    
    # 4. Extraer
    Write-Host "[*] Extrayendo archivos..." -ForegroundColor Yellow
    try {
        Expand-Archive -Path $zipFile -DestinationPath $installRoot -Force -ErrorAction Stop
        Remove-Item $zipFile -Force
        Write-Host "[OK] JMeter extraido correctamente." -ForegroundColor Green
    } catch {
        Write-Host "[X] Error al extraer el archivo. Asegurate de tener permisos." -ForegroundColor Red
        return
    }
}

# 5. Configurar PATH (Sesion actual)
if ($env:PATH -notlike "*$binPath*") {
    Write-Host "[*] Agregando JMeter al PATH de la sesion..." -ForegroundColor Yellow
    $env:PATH += ";$binPath"
}

# 6. Configurar PATH (Permanente - Usuario)
Write-Host "[*] Configurando PATH permanente (Usuario)..." -ForegroundColor Yellow
$oldPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($oldPath -notlike "*$binPath*") {
    $newPath = "$oldPath;$binPath"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Host "[OK] PATH actualizado permanentemente." -ForegroundColor Green
} else {
    Write-Host "[OK] El PATH ya estaba configurado." -ForegroundColor Green
}

Write-Host "====================================================" -ForegroundColor Green
Write-Host " [OK] Instalacion completada con exito." -ForegroundColor Green
Write-Host " Por favor, REINICIA tu terminal para usar el comando 'jmeter'." -ForegroundColor White
Write-Host "====================================================" -ForegroundColor Green
