import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Persona from "./persona.model.js";

const Licencia = sequelize.define(
  "Licencia",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    persona_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "personas",
        key: "id",
      },
    },
    numero_licencia: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    categoria: {
      type: DataTypes.ENUM("A1", "A2", "B1", "B2", "B3", "C1", "C2", "C3"),
      allowNull: false,
    },
    fecha_expedicion: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    fecha_vencimiento: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM("vigente", "suspendida", "vencida", "cancelada"),
      allowNull: false,
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
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "licencias_conduccion",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    paranoid: true,
    freezeTableName: true,
    indexes: [
      {
        unique: true,
        fields: ["persona_id", "categoria"],
      },
    ],
  }
);

Persona.hasMany(Licencia, {
  foreignKey: "persona_id",
  as: "licencias",
});

Licencia.belongsTo(Persona, {
  foreignKey: "persona_id",
  as: "persona",
});

export default Licencia;