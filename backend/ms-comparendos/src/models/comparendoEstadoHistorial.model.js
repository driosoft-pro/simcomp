import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Comparendo from "./comparendo.model.js";

const ComparendoEstadoHistorial = sequelize.define(
  "comparendo_transiciones_estado",
  {
    transicion_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    comparendo_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    estado_origen: {
      type: DataTypes.ENUM("CREADO", "PAGADO", "ANULADO"),
      allowNull: true,
    },
    estado_destino: {
      type: DataTypes.ENUM("CREADO", "PAGADO", "ANULADO"),
      allowNull: false,
    },
    trigger_evento: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    detalle: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "comparendo_transiciones_estado",
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