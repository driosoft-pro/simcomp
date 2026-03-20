import { validationResult } from "express-validator";
import {
  crearPersona,
  listarPersonas,
  obtenerPersonaPorDocumento,
  obtenerPersonaPorId,
  obtenerPersonaPorEmail,
  validarExistenciaPersona,
  actualizarPersona,
} from "../services/personas.service.js";

export async function crearPersonaController(req, res) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        ok: false,
        errors: errors.array(),
      });
    }

    const persona = await crearPersona(req.body);

    // Si el creador es supervisor, crear automáticamente el usuario Agente
    const requesterRole = req.headers["x-user-role"];
    if (requesterRole === "supervisor") {
      try {
        const authServiceUrl = process.env.AUTH_SERVICE_URL || "http://ms-auth-service:8001/api/auth";
        const authBaseUrl = authServiceUrl.replace("/auth", "");
        
        await fetch(`${authBaseUrl}/Usuarios`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": req.headers["authorization"],
            "x-user-role": requesterRole
          },
          body: JSON.stringify({
            username: persona.numero_documento,
            email: persona.email,
            password: persona.numero_documento, // Password por defecto = documento
            rol: "agente",
            estado: "activo"
          })
        });
        console.log(`Usuario Agente auto-creado para persona ${persona.numero_documento}`);
      } catch (authError) {
        console.error("Error al auto-crear usuario para supervisor:", authError.message);
        // No bloqueamos la creación de persona si falla el auth, pero informamos en logs
      }
    }

    return res.status(201).json({
      ok: true,
      message: "Persona creada correctamente",
      data: persona,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        ok: false,
        message: "Ya existe un registro con estos datos únicos",
      });
    }
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}

export async function listarPersonasController(req, res) {
  try {
    let personas = await listarPersonas();

    const userRole = req.headers["x-user-role"];

    // Si es supervisor o agente, solo puede ver personas que correspondan a usuarios permitidos
    if (userRole === "supervisor" || userRole === "agente") {
      console.log(`Filtrando lista de personas para ${userRole}.`);
      
      try {
        const authServiceUrl = process.env.AUTH_SERVICE_URL || "http://localhost:8001";
        const response = await fetch(`${authServiceUrl}/api/Usuarios`, {
          headers: {
            "Authorization": req.headers["authorization"],
            "x-user-role": userRole // Pasar el rol para que el ms-auth también filtre si es necesario
          }
        });

        if (response.ok) {
          const result = await response.json();
          const allowedUsers = result.data || [];
          const allowedEmails = new Set(allowedUsers.map(u => u.email.toLowerCase()));
          
          personas = personas.filter(p => p.email && allowedEmails.has(p.email.toLowerCase()));
          console.log(`Personas filtradas para ${userRole}: ${personas.length}`);
        } else {
          console.error(`Error al consultar ms-auth-service para filtrar personas (${userRole})`);
          // Si falla la comunicación, por seguridad retornamos lista vacía o error
          personas = [];
        }
      } catch (fetchError) {
        console.error("Error de conexión con ms-auth-service:", fetchError.message);
        personas = [];
      }
    }

    return res.json({
      ok: true,
      data: personas,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        ok: false,
        message: "Ya existe un registro con estos datos únicos",
      });
    }
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}

export async function obtenerPersonaPorIdController(req, res) {
  try {
    const { persona_id } = req.params;
    const persona = await obtenerPersonaPorId(persona_id);

    if (!persona) {
      return res.status(404).json({
        ok: false,
        message: "Persona no encontrada",
      });
    }

    // Restricción para agentes y supervisores: solo pueden ver personas que correspondan a usuarios permitidos
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
          const isAllowed = allowedUsers.some(u => u.email.toLowerCase() === persona.email.toLowerCase());
          
          if (!isAllowed) {
            return res.status(403).json({
              ok: false,
              message: `No tienes permiso para ver los datos de esta persona (${userRole})`,
            });
          }
        } else {
          console.error(`Error ms-auth (${userRole}): ${response.status}`);
          return res.status(500).json({ ok: false, message: "Error validando permisos con el servicio de autenticación" });
        }
      } catch (error) {
        console.error("Error conexión ms-auth:", error.message);
        return res.status(500).json({ ok: false, message: "Error de conexión con el servicio de autenticación" });
      }
    }

    return res.json({
      ok: true,
      data: persona,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        ok: false,
        message: "Ya existe un registro con estos datos únicos",
      });
    }
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}

export async function obtenerPersonaPorDocumentoController(req, res) {
  try {
    const { numero } = req.params;
    const persona = await obtenerPersonaPorDocumento(numero);

    if (!persona) {
      return res.status(404).json({
        ok: false,
        message: "Persona no encontrada",
      });
    }

    // Restricción para agentes y supervisores
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
          const isAllowed = allowedUsers.some(u => u.email.toLowerCase() === persona.email.toLowerCase());
          
          if (!isAllowed) {
            return res.status(403).json({
              ok: false,
              message: `No tienes permiso para ver los datos de esta persona (${userRole})`,
            });
          }
        } else {
          return res.status(500).json({ ok: false, message: "Error validando permisos con el servicio de autenticación" });
        }
      } catch (error) {
        return res.status(500).json({ ok: false, message: "Error de conexión con el servicio de autenticación" });
      }
    }

    return res.json({
      ok: true,
      data: persona,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        ok: false,
        message: "Ya existe un registro con estos datos únicos",
      });
    }
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}

export async function validarExistenciaPersonaController(req, res) {
  try {
    const { numero } = req.params;
    const result = await validarExistenciaPersona(numero);

    return res.json({
      ok: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}
export async function obtenerPersonaPorEmailController(req, res) {
  try {
    const { email } = req.params;
    const persona = await obtenerPersonaPorEmail(email);

    if (!persona) {
      return res.status(404).json({
        ok: false,
        message: "Persona no encontrada",
      });
    }

    // Restricción para agentes y supervisores
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
          const isAllowed = allowedUsers.some(u => u.email.toLowerCase() === persona.email.toLowerCase());
          
          if (!isAllowed) {
            return res.status(403).json({
              ok: false,
              message: `No tienes permiso para ver los datos de esta persona (${userRole})`,
            });
          }
        } else {
          return res.status(500).json({ ok: false, message: "Error validando permisos con el servicio de autenticación" });
        }
      } catch (error) {
        return res.status(500).json({ ok: false, message: "Error de conexión con el servicio de autenticación" });
      }
    }

    return res.json({
      ok: true,
      data: persona,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}

export async function actualizarPersonaController(req, res) {
  try {
    const { persona_id } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        ok: false,
        errors: errors.array(),
      });
    }

    const requesterRole = req.headers["x-user-role"];
    const requesterId = req.headers["x-user-id"];

    const personaActual = await obtenerPersonaPorId(persona_id);
    if (!personaActual) {
      return res.status(404).json({ ok: false, message: "Persona no encontrada" });
    }

    // Determine target role by calling ms-auth-service
    let targetRole = "ciudadano"; // Default
    try {
      const authServiceUrl = process.env.AUTH_SERVICE_URL || "http://ms-auth-service:8001/api/auth";
      const authBaseUrl = authServiceUrl.replace("/auth", "");
      const response = await fetch(`${authBaseUrl}/Usuarios/email/${personaActual.email}`);
      if (response.ok) {
        const result = await response.json();
        targetRole = result.data?.rol || "ciudadano";
      }
    } catch (error) {
      console.error("Error fetching target role from ms-auth-service:", error.message);
    }

    const isOwnProfile = personaActual.email === req.headers["x-user-email"]; // Assuming we pass email in headers or can find by ID

    // Permission check
    let canUpdate = false;
    let allowedFields = [];

    if (requesterRole === "admin") {
      canUpdate = true;
      allowedFields = ["tipo_documento", "numero_documento", "nombres", "apellidos", "fecha_nacimiento", "genero", "direccion", "telefono", "email", "estado"];
    } else if (isOwnProfile) {
      canUpdate = true;
      if (requesterRole === "agente") {
        allowedFields = ["nombres", "apellidos", "email", "direccion", "telefono"];
      } else if (requesterRole === "supervisor") {
        allowedFields = ["nombres", "apellidos", "email", "direccion", "telefono"];
      } else if (requesterRole === "ciudadano") {
        allowedFields = ["email", "direccion"];
      }
    } else if (requesterRole === "agente" && targetRole === "ciudadano") {
      canUpdate = true;
      allowedFields = ["tipo_documento", "numero_documento", "nombres", "apellidos", "fecha_nacimiento", "genero", "direccion", "telefono", "email", "estado"];
    } else if (requesterRole === "supervisor" && targetRole === "agente") {
      canUpdate = true;
      allowedFields = ["tipo_documento", "numero_documento", "nombres", "apellidos", "fecha_nacimiento", "genero", "direccion", "telefono", "email", "estado"];
    }

    if (!canUpdate) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permiso para actualizar este perfil",
      });
    }

    // Filter body based on allowed fields
    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        ok: false,
        message: "No hay campos válidos para actualizar",
      });
    }

    // Handle state update restriction for non-admins
    if (updateData.estado === "inactivo" && requesterRole !== "admin") {
       if (requesterRole === "supervisor" && targetRole === "agente") {
         // Supervisor can inactive agente, this is allowed
       } else {
         return res.status(403).json({
           ok: false,
           message: "Solo los administradores y supervisores (para agentes) pueden inhabilitar personas",
         });
       }
    }

    const persona = await actualizarPersona(persona_id, req.body);

    return res.json({
      ok: true,
      message: "Persona actualizada correctamente",
      data: persona,
    });
  } catch (error) {
    if (error.message === "Persona no encontrada") {
      return res.status(404).json({
        ok: false,
        message: error.message,
      });
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        ok: false,
        message: "Ya existe un registro con estos datos únicos",
      });
    }
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}
