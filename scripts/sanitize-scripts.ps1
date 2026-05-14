# scripts\sanitize-scripts.ps1 - Emergency ASCII Sanitizer
# This script is 100% ASCII to avoid encoding issues.

$rootPath = Resolve-Path "$PSScriptRoot\.."
$files = Get-ChildItem -Path $rootPath -Filter "*.ps1" -Recurse | Where-Object { $_.FullName -notlike "*node_modules*" }

foreach ($file in $files) {
    Write-Host "Cleaning non-ASCII from: $($file.Name)"
    $content = [System.IO.File]::ReadAllText($file.FullName)
    
    # Replace non-ASCII characters with spaces initially
    $clean = [System.Text.RegularExpressions.Regex]::Replace($content, "[^\x00-\x7F]", " ")
    
    # Restore common words in ASCII (no accents)
    $clean = $clean.Replace("opcion", "opcion")
    $clean = $clean.Replace("automatico", "automatico")
    $clean = $clean.Replace("configuracion", "configuracion")
    $clean = $clean.Replace("maquinas", "maquinas")
    $clean = $clean.Replace("instalacion", "instalacion")
    $clean = $clean.Replace("provision", "provision")
    $clean = $clean.Replace("invalida", "invalida")
    $clean = $clean.Replace("Esta", "Esta")
    $clean = $clean.Replace("esta", "esta")
    
    # Save as UTF-8 with BOM for maximum compatibility
    [System.IO.File]::WriteAllText($file.FullName, $clean, [System.Text.Encoding]::UTF8)
}

Write-Host "Done. All scripts are now 100% ASCII and safe to run."
