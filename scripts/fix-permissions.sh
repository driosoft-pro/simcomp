#!/usr/bin/env bash
# fix-permissions.sh - Repara los permisos de ejecución de los scripts
# =============================================================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[*] Aplicando permisos de ejecución (+x)...${NC}"

# Scripts en la raíz
chmod +x simcomp-manager.sh 2>/dev/null

# Scripts en el directorio /scripts
chmod +x scripts/*.sh 2>/dev/null
chmod +x backend/*.sh 2>/dev/null

echo -e "${GREEN}[✔] Permisos aplicados correctamente.${NC}"
