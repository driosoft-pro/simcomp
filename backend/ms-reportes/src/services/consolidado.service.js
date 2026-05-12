import { fetchModuleData } from "./httpClients.js";
import { toCsv } from "./csv.service.js";

/**
 * Genera un dataset consolidado uniendo información de todos los microservicios.
 * Sigue el esquema de dataset_simcomp.csv.
 */
export async function buildConsolidatedDataset(token) {
  try {
    // 1. Obtener todos los datos (sin límites de paginación)
    const [usuariosRes, personasRes, automotoresRes, infraccionesRes, comparendosRes] = await Promise.all([
      fetchModuleData("usuarios",    token, { limit: 1000000 }).catch(() => []),
      fetchModuleData("personas",    token, { limit: 1000000 }).catch(() => []),
      fetchModuleData("automotores", token, { limit: 1000000 }).catch(() => []),
      fetchModuleData("infracciones",token, { limit: 1000000 }).catch(() => []),
      fetchModuleData("comparendos", token, { limit: 1000000 }).catch(() => []),
    ]);

    const usuarios = Array.isArray(usuariosRes) ? usuariosRes : [];
    const personas = Array.isArray(personasRes) ? personasRes : [];
    const automotores = Array.isArray(automotoresRes) ? automotoresRes : [];
    const infracciones = Array.isArray(infraccionesRes) ? infraccionesRes : [];
    const comparendos = Array.isArray(comparendosRes) ? comparendosRes : [];

    // 2. Crear mapas para búsqueda rápida O(1)
    const personasMap = new Map();
    personas.forEach(p => {
      if (p.numero_documento) personasMap.set(String(p.numero_documento), p);
    });

    const automotoresMap = new Map();
    automotores.forEach(a => {
      if (a.placa) automotoresMap.set(String(a.placa), a);
    });

    const infraccionesMap = new Map();
    infracciones.forEach(i => {
      if (i.codigo) infraccionesMap.set(String(i.codigo), i);
    });

    const usuariosMap = new Map();
    usuarios.forEach(u => {
      if (u.username) usuariosMap.set(String(u.username), u);
      if (u.numero_documento) usuariosMap.set(String(u.numero_documento), u);
    });

    // 3. Cruzar datos (Join)
    return comparendos.map(c => {
      const persona = personasMap.get(String(c.ciudadano_documento));
      const vehiculo = automotoresMap.get(String(c.placa_vehiculo));
      const infraccion = infraccionesMap.get(String(c.infraccion_codigo));
      const usuarioCiudadano = usuariosMap.get(String(c.ciudadano_documento));
      const usuarioAgente = usuariosMap.get(String(c.agente_documento));

      const licencia = (persona && Array.isArray(persona.licencias) && persona.licencias.length > 0) 
        ? persona.licencias[0] 
        : null;

      return {
        comparendo_id: c.id,
        numero_comparendo: c.numero_comparendo,
        fecha_comparendo: c.fecha_comparendo,
        estado_comparendo: c.estado,
        ciudadano_documento: c.ciudadano_documento,
        ciudadano_nombre: c.ciudadano_nombre || (persona ? `${persona.nombres} ${persona.apellidos}` : "N/A"),
        ciudadano_email: persona?.email || "N/A",
        ciudadano_tiene_usuario: !!usuarioCiudadano,
        ciudadano_username: usuarioCiudadano?.username || "N/A",
        ciudadano_tiene_licencia: !!licencia,
        licencia_numero: licencia?.numero_licencia || "N/A",
        licencia_categoria: licencia?.categoria || "N/A",
        licencia_estado: licencia?.estado || "N/A",
        licencia_vencimiento: licencia?.fecha_vencimiento || "N/A",
        placa_vehiculo: c.placa_vehiculo,
        marca_vehiculo: vehiculo?.marca || "N/A",
        linea_vehiculo: vehiculo?.linea || "N/A",
        modelo_vehiculo: vehiculo?.modelo || "N/A",
        servicio_vehiculo: vehiculo?.tipo_servicio || "N/A",
        agente_documento: c.agente_documento,
        agente_nombre: c.agente_nombre,
        agente_username: usuarioAgente?.username || "N/A",
        infraccion_codigo: c.infraccion_codigo,
        infraccion_descripcion: c.infraccion_descripcion,
        tipo_sancion: infraccion?.tipo_sancion || "N/A",
        valor_multa: c.valor_multa,
        lugar: c.lugar,
        ciudad: c.ciudad
      };
    });
  } catch (error) {
    console.error("[CONSOLIDADO] Error critico construyendo dataset:", error);
    return []; // Fallback seguro
  }
}

export async function exportConsolidatedCsv(token) {
  const data = await buildConsolidatedDataset(token);
  return toCsv(data);
}

