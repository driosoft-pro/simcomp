import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Automotor = sequelize.define(
  "Automotor",
  {
    automotor_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    placa: {
      type: DataTypes.STRING(8),
      allowNull: false,
      unique: true,
    },

    tipo: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    marca: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    modelo: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    anio: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },

    color: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },

    cilindraje: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    estado: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    propietario_id: {
      type: DataTypes.UUID,
      allowNull: false,
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
      allowNull: true
    },

  },
  {
    tableName: "automotores",
    timestamps: false,
  }
);

export default Automotor;
