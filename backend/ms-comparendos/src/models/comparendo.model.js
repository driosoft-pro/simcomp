import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Comparendo = sequelize.define(
  "comparendos",
  {
    comparendo_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    numero_comparendo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    fecha_hora: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    automotor_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    persona_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    infraccion_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    direccion_exacta: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM("CREADO", "PAGADO", "ANULADO"),
      allowNull: false,
      defaultValue: "CREADO",
    },
    valor_multa: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
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
  },
  {
    timestamps: false,
  }
);

export default Comparendo;