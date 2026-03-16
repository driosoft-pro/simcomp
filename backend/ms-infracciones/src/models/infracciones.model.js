import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Infraccion = sequelize.define(
  "Infraccion",
  {
    infraccion_id: {
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
      validate: {
        min: 0,
      },
    },

    dias_suspension: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
      },
    },

    aplica_descuento: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    vigente: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    deletet_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "infracciones",
    timestamps: false,
  }
);

export default Infraccion;