import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Comparendo from "./comparendo.model.js";

const ComparendoEstadoHistorial = sequelize.define(
  "historial_comparendos",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    comparendo_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    estado_anterior: {
      type: DataTypes.ENUM("PENDIENTE", "PAGADO", "ANULADO"),
      allowNull: true,
    },
    estado_nuevo: {
      type: DataTypes.ENUM("PENDIENTE", "PAGADO", "ANULADO"),
      allowNull: false,
    },
    observacion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fecha_evento: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
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
    tableName: "historial_comparendos",
    timestamps: false,
  }
);

Comparendo.hasMany(ComparendoEstadoHistorial, {
  foreignKey: "comparendo_id",
  as: "historial",
});

ComparendoEstadoHistorial.belongsTo(Comparendo, {
  foreignKey: "comparendo_id",
  as: "comparendo",
});

export default ComparendoEstadoHistorial;