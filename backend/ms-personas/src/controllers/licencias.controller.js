import { validationResult } from "express-validator";
import {
  crearLicencia,
  listarLicencias,
  listarLicenciasPorPersona,
  obtenerLicenciaPorNumero,
  actualizarLicencia,
  suspenderLicenciasPorDocumento,
  reactivarLicenciasPorDocumento,
} from "../services/licencias.service.js";

export async function crearLicenciaController(req, res) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        ok: false,
        errors: errors.array(),
      });
    }

    const licencia = await crearLicencia(req.body);

    return res.status(201).json({
      ok: true,
      message: "Licencia creada correctamente",
      data: licencia,
    });
  } catch (error) {
    const status = error.message.includes("no existe") ? 404 : 500;

    return res.status(status).json({
      ok: false,
      message: error.message,
    });
  }
}

export async function listarLicenciasController(req, res) {
  try {
    let licencias = await listarLicencias();

    const userRole = req.headers["x-user-role"];
    if (userRole === "agente" || userRole === "supervisor") {
      try {
        const authServiceUrl = process.env.AUTH_SERVICE_URL || "http://localhost:8001";
        const response = await fetch(`${authServiceUrl}/api/Usuarios`, {
          headers: {
            "Authorization": req.headers["authorization"],
            "x-user-role": userRole
          }
        });

        if (response.ok) {
          const result = await response.json();
          const allowedUsers = result.data || [];
          const allowedEmails = new Set(allowedUsers.map(u => u.email.toLowerCase()));
          
          licencias = licencias.filter(lic => {
            const personaEmail = lic.persona?.email || lic.persona_email; 
            // Nota: Depende de cómo el servicio de licencias devuelva los datos. 
            // Si no tiene el email, tendríamos que buscar la persona primero.
            return personaEmail && allowedEmails.has(personaEmail.toLowerCase());
          });
        } else {
          licencias = [];
        }
      } catch (error) {
        console.error("Error filtrando licencias:", error.message);
        licencias = [];
      }
    }

    return res.json({
      ok: true,
      data: licencias,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}

export async function listarLicenciasPorPersonaController(req, res) {
  try {
    const { persona_id } = req.params;
    
    // Verificación de permisos para agente/supervisor
    const userRole = req.headers["x-user-role"];
    if (userRole === "agente" || userRole === "supervisor") {
      const { obtenerPersonaPorId } = await import("../services/personas.service.js");
      const persona = await obtenerPersonaPorId(persona_id);
      
      if (!persona) {
        return res.status(404).json({ ok: false, message: "Persona no encontrada" });
      }

      const authServiceUrl = process.env.AUTH_SERVICE_URL || "http://localhost:8001";
      const response = await fetch(`${authServiceUrl}/api/Usuarios`, {
        headers: {
          "Authorization": req.headers["authorization"],
          "x-user-role": userRole
        }
      });

      if (response.ok) {
        const result = await response.json();
        const allowedUsers = result.data || [];
        const isAllowed = allowedUsers.some(u => u.email.toLowerCase() === persona.email.toLowerCase());
        
        if (!isAllowed) {
          return res.status(403).json({
            ok: false,
            message: `No tienes permiso para ver las licencias de esta persona (${userRole})`,
          });
        }
      } else {
        return res.status(500).json({ ok: false, message: "Error validando permisos" });
      }
    }

    const licencias = await listarLicenciasPorPersona(persona_id);

    return res.json({
      ok: true,
      data: licencias,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        ok: false,
        message: "Ya existe un registro con estos datos únicos (ej: número de licencia)",
      });
    }
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}

export async function obtenerLicenciaPorNumeroController(req, res) {
  try {
    const { numero } = req.params;
    const licencia = await obtenerLicenciaPorNumero(numero);

    if (!licencia) {
      return res.status(404).json({
        ok: false,
        message: "Licencia no encontrada",
      });
    }

    // Verificación de permisos para agente/supervisor
    const userRole = req.headers["x-user-role"];
    if (userRole === "agente" || userRole === "supervisor") {
      const personaEmail = licencia.persona?.email;
      if (!personaEmail) {
        // Si no tenemos el email directamente, no podemos validar fácilmente aquí
        // a menos que el service devuelva la relación poblada.
        return res.status(403).json({ ok: false, message: "No se pudo validar el acceso a esta licencia" });
      }

      const authServiceUrl = process.env.AUTH_SERVICE_URL || "http://localhost:8001";
      const response = await fetch(`${authServiceUrl}/api/Usuarios`, {
        headers: {
          "Authorization": req.headers["authorization"],
          "x-user-role": userRole
        }
      });

      if (response.ok) {
        const result = await response.json();
        const allowedUsers = result.data || [];
        const isAllowed = allowedUsers.some(u => u.email.toLowerCase() === personaEmail.toLowerCase());
        
        if (!isAllowed) {
          return res.status(403).json({
            ok: false,
            message: `No tienes permiso para ver esta licencia (${userRole})`,
          });
        }
      } else {
        return res.status(500).json({ ok: false, message: "Error validando permisos" });
      }
    }

    return res.json({
      ok: true,
      data: licencia,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}
export async function actualizarLicenciaController(req, res) {
  try {
    const { licencia_id } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        ok: false,
        errors: errors.array(),
      });
    }

    const licencia = await actualizarLicencia(licencia_id, req.body);

    return res.json({
      ok: true,
      message: "Licencia actualizada correctamente",
      data: licencia,
    });
  } catch (error) {
    const status = error.message.includes("no existe") ? 404 : 500;
    return res.status(status).json({
      ok: false,
      message: error.message,
    });
  }
}

export async function suspenderLicenciasPorDocumentoController(req, res) {
  try {
    const { documento } = req.params;
    const result = await suspenderLicenciasPorDocumento(documento);

    return res.json({
      ok: true,
      message: `Licencias suspendidas: ${result.suspendidas}`,
      data: result,
    });
  } catch (error) {
    const status = error.message.includes("no encontrada") ? 404 : 500;
    return res.status(status).json({
      ok: false,
      message: error.message,
    });
  }
}

export async function reactivarLicenciasPorDocumentoController(req, res) {
  try {
    const { documento } = req.params;
    const result = await reactivarLicenciasPorDocumento(documento);

    return res.json({
      ok: true,
      message: `Licencias reactivadas: ${result.reactivadas}`,
      data: result,
    });
  } catch (error) {
    const status = error.message.includes("no encontrada") ? 404 : 500;
    return res.status(status).json({
      ok: false,
      message: error.message,
    });
  }
}
