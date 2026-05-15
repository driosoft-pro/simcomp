# SIMCOMP — Pruebas de Carga y Rendimiento (JMeter)

Este directorio contiene los planes de prueba para validar la escalabilidad, estabilidad y rendimiento del ecosistema SIMCOMP bajo diferentes escenarios de carga.

## Archivos de Prueba (.jmx)

Para quienes están empezando, estos archivos pueden abrirse en la interfaz gráfica de JMeter (`jmeter.sh` o `jmeter.bat`):

1. **`simcomp_login.jmx`**: Prueba básica de autenticación. Valida el tiempo de respuesta del `ms-auth-service`.
2. **`simcomp_comparendos.jmx`**: Pruebas de lectura y escritura en el microservicio de comparendos.
3. **`simcomp_estres-frontend.jmx`**: Simulación de cientos de usuarios accediendo simultáneamente a la página web (Nginx).
4. **`simcomp_workflow_completo.jmx`**: **(Recomendado)** Realiza un flujo real: Login -> Obtener Token -> Consultar Personas -> Consultar Vehículos -> Listar Comparendos.

---

## Ejecución Profesional (Modo CLI)

Para obtener resultados precisos y métricas de nivel de producción, se debe ejecutar JMeter sin interfaz gráfica. Esto genera un **Dashboard HTML interactivo**.

### Comando de Ejecución:
Desde la raíz del proyecto:

```bash
# 1. Crear carpeta para resultados
mkdir -p jmeter/results

# 2. Ejecutar y generar reporte
jmeter -n -t jmeter/simcomp_workflow_completo.jmx \
    -l jmeter/results/workflow.jtl \
    -e -o jmeter/report
```

---

## ¿Qué métricas muestra el Reporte HTML?

El reporte generado en `jmeter/report/index.html` proporciona las siguientes métricas críticas:

*  **APDEX (Application Performance Index)**: Índice de 0 a 1 que mide la satisfacción del usuario. > 0.9 es excelente.
*  **Requests Per Second (Throughput)**: Cuántas peticiones por segundo procesó el clúster antes de saturarse.
*  **Response Time Percentiles (95th & 99th)**: Indica el tiempo de respuesta del 95% y 99% de los usuarios. Es más realista que el promedio simple.
*  **Error %**: Porcentaje de peticiones fallidas (ej: por timeouts o caídas de servicios).
*  **Response Time vs Threads**: Gráfica que muestra cómo aumenta la latencia a medida que entran más usuarios concurrentes.

---

## Configuración del Entorno

Todos los archivos `.jmx` utilizan la variable `${server}`.
- Por defecto apunta a: `simcomp.co` (debe estar en tu archivo `/etc/hosts` o `C:\Windows\System32\drivers\etc\hosts`).
- Si deseas probar contra una IP específica sin modificar el archivo, puedes pasar el parámetro por consola:
 `jmeter -Jserver=192.168.100.2 -n -t ...`

---
*SIMCOMP — Calidad y Rendimiento Garantizados con Apache JMeter 5.6+*
