import Papa from "papaparse";
import { env } from "../config/env.js";

const requiredFieldsByModule = {
  usuarios: ["username", "email", "rol", "password"],
  personas: ["documento", "nombres", "apellidos", "email"],
  automotores: ["placa", "vin", "marca", "linea", "modelo", "persona_id"],
  infracciones: ["codigo", "descripcion", "valor_base"],
  comparendos: ["numero_comparendo", "ciudadano_documento", "placa_vehiculo", "infraccion_codigo", "fecha_comparendo", "estado"]
};

export function parseCsvBuffer(buffer) {
  const content = buffer.toString("utf-8");

  const result = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
    transform: (value) => typeof value === "string" ? value.trim() : value
  });

  if (result.errors?.length) {
    throw new Error(`CSV invalido: ${result.errors[0].message}`);
  }

  if (!Array.isArray(result.data)) {
    throw new Error("No fue posible parsear el CSV");
  }

  if (result.data.length > env.maxImportRows) {
    throw new Error(`El archivo supera el maximo permitido de ${env.maxImportRows} filas`);
  }

  return result.data;
}

export function validateCsvRows(modulo, rows) {
  const required = requiredFieldsByModule[modulo] || [];

  if (!rows.length) {
    throw new Error("El CSV no contiene filas");
  }

  const headers = Object.keys(rows[0] || {});
  const missing = required.filter((field) => !headers.includes(field));

  if (missing.length) {
    throw new Error(`Faltan columnas requeridas para ${modulo}: ${missing.join(", ")}`);
  }

  return true;
}

export function toCsv(data) {
  return Papa.unparse(data, {
    header: true,
    skipEmptyLines: true
  });
}