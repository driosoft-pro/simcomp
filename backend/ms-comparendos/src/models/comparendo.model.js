import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Comparendo = sequelize.define(
  "comparendos",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    numero_comparendo: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    ciudadano_documento: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    ciudadano_nombre: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    agente_documento: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    agente_nombre: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    placa_vehiculo: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    infraccion_codigo: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    infraccion_descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    valor_multa: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    fecha_comparendo: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    lugar: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    ciudad: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM("PENDIENTE", "PAGADO", "ANULADO"),
      allowNull: false,
      defaultValue: "PENDIENTE",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "comparendos",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    paranoid: true,
    // ── Índices críticos ─────────────────────────────────────────────────────
    // Sin estos, cada filtro por documento/placa/estado hace full table scan.
    indexes: [
      // Filtros más frecuentes: ciudadano ve sus propios comparendos
      { fields: ["ciudadano_documento"] },
      // Agente ve los comparendos que emitió
      { fields: ["agente_documento"] },
      // Búsqueda por placa (listado de vehículo)
      { fields: ["placa_vehiculo"] },
      // Filtro por estado (PENDIENTE/PAGADO/ANULADO)
      { fields: ["estado"] },
      // Ordenamiento por fecha (ORDER BY fecha_comparendo DESC es la query más común)
      { fields: ["fecha_comparendo"] },
      // Índice compuesto para el patrón LIKE 'COMP-YYYY-DDD-%' de obtenerSiguienteNumero
      { fields: ["numero_comparendo"] },
      // Compuesto: ciudadano filtrando sus pendientes (dashboard)
      { fields: ["ciudadano_documento", "estado"] },
    ],
  }
);

export default Comparendo;