#!/bin/bash
# SIMCOMP - GESTOR CENTRAL DE INFRAESTRUCTURA (LINUX)

function main_menu() {
    clear
    echo "===================================================="
    echo "       SIMCOMP - PANEL DE CONTROL CENTRAL"
    echo "===================================================="
    echo " [1] Configurar Entorno (.env y Secretos)"
    echo " [2] Configurar DNS Local (/etc/hosts)"
    echo " [3] Gestionar Infraestructura (Vagrant/Swarm)"
    echo " [4] Compilar Imágenes Docker (Build masivo)"
    echo " [5] Ejecutar Pruebas JMeter (CLI + Reporte HTML)"
    echo " [6] Sincronizar Ramas de Microservicios (GIT)"
    echo " [0] Salir"
    echo "----------------------------------------------------"
    read -p " Selecciona una opción: " OPTION

    case $OPTION in
        1)
            ./scripts/build-envs.sh
            ./scripts/build-secrets.sh
            ;;
        2)
            sudo ./scripts/setup-hosts.sh
            ;;
        3)
            ./scripts/vagrant-manager.sh
            ;;
        4)
            ./scripts/build-and-push-dockerhub.sh build
            ;;
        5)
            ./scripts/vagrant-manager.sh 7
            ;;
        6)
            echo " [!] Iniciando Sincronización de Ramas..."
            git checkout dev
            branches=("frontend" "ms-auth-service" "ms-automotores" "ms-comparendos" "ms-infracciones" "ms-personas" "ms-reportes" "analytics-spark-service")
            for b in "${branches[@]}"; do
                echo " --- Procesando $b ---"
                git checkout -B $b dev
                git filter-branch --subdirectory-filter "$([[ $b == ms-* ]] && echo backend/$b || echo $b)" --force
                git push origin $b --force
            done
            git checkout dev
            echo " [✔] Repositorio sincronizado."
            ;;
        0) exit 0 ;;
        *) echo " Opción inválida." ;;
    esac
    read -p " Presiona Enter para continuar..."
    main_menu
}

main_menu
