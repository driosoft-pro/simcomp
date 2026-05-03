#!/bin/bash
# SIMCOMP - INSTALADOR DE DEPENDENCIAS
# Instala dependencias para microservicios y frontend usando pnpm o npm

set -e

# Directorios a procesar
DIRECTORIES=(
    "frontend"
    "backend/ms-auth-service"
    "backend/ms-automotores"
    "backend/ms-comparendos"
    "backend/ms-infracciones"
    "backend/ms-personas"
    "backend/ms-reportes"
)

# Función para instalar dependencias
install_dependencies() {
    local dir=$1
    echo "===================================================="
    echo " Procesando: $dir"
    echo "===================================================="

    if [ -d "$dir" ]; then
        cd "$dir"
        
        if [ -f "pnpm-lock.yaml" ]; then
            echo " [!] pnpm detectado. Ejecutando 'pnpm install'..."
            if command -v pnpm &> /dev/null; then
                pnpm install
            else
                echo " [X] pnpm no está instalado. Intentando con npm..."
                npm install
            fi
        elif [ -f "package.json" ]; then
            echo " [!] package.json detectado. Ejecutando 'npm install'..."
            npm install
        else
            echo " [?] No se encontró package.json en $dir. Saltando..."
        fi
        
        cd - > /dev/null
    else
        echo " [X] El directorio $dir no existe. Saltando..."
    fi
    echo ""
}

# Ejecutar instalación en cada directorio
for dir in "${DIRECTORIES[@]}"; do
    install_dependencies "$dir"
done

echo "===================================================="
echo " [✔] Proceso de instalación finalizado."
echo "===================================================="
