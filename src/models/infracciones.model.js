import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Infraccion = sequelize.define(
  "Infraccion",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    codigo: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    articulo_codigo: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    tipo_sancion: {
      type: DataTypes.ENUM(
        "MONETARIA",
        "SUSPENSION_LICENCIA",
        "INMOVILIZACION",
        "MIXTA"
      ),
      allowNull: false,
    },
    valor_multa: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    dias_suspension: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM("activo", "inactivo"),
      allowNull: false,
      defaultValue: "activo",
    },
    aplica_descuento: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    vigente: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "infracciones",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    paranoid: true,
    freezeTableName: true,
    // ── Índices críticos para optimización de consultas ───────────────────────
    indexes: [
      // codigo: usado para validación y lookups rápidos en ms-comparendos
      { fields: ["codigo"] },
      // tipo_sancion: usado para filtros y estadísticas en ms-reportes
      { fields: ["tipo_sancion"] },
      // estado/vigente: filtros comunes en listados del frontend
      { fields: ["estado"] },
      { fields: ["vigente"] },
      // Compuesto: listado de infracciones vigentes y activas
      { fields: ["estado", "vigente"] },
    ],
  }
);

export default Infraccion;