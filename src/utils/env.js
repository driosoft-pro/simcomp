import fs from 'fs';

/**
 * Obtiene una variable de entorno, priorizando process.env y luego Docker Secrets.
 * 
 * @param {string} key - Nombre de la variable (ej: DB_PASSWORD)
 * @param {any} defaultValue - Valor por defecto si no se encuentra
 * @returns {string|any} - El valor de la variable o secreto
 */
export const getEnv = (key, defaultValue = null) => {
  // 1. Prioridad: process.env (Útil para desarrollo local y Docker normal)
  if (process.env[key]) {
    return process.env[key];
  }

  // 2. Docker Secrets (/run/secrets/nombre_secreto)
  // Docker Swarm monta los secretos en archivos dentro de esta ruta
  const secretPath = `/run/secrets/${key.toLowerCase()}`;
  if (fs.existsSync(secretPath)) {
    try {
      return fs.readFileSync(secretPath, 'utf8').trim();
    } catch (err) {
      console.warn(`[Config] Error leyendo secreto ${key} en ${secretPath}:`, err.message);
    }
  }

  return defaultValue;
};
