import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Persona = sequelize.define(
  "Persona",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    tipo_documento: {
      type: DataTypes.ENUM("CC", "CE", "TI", "PASAPORTE"),
      allowNull: false,
      defaultValue: "CC",
    },
    numero_documento: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    nombres: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    apellidos: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    fecha_nacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    genero: {
      type: DataTypes.ENUM("M", "F", "O"),
      allowNull: false,
    },
    direccion: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    estado: {
      type: DataTypes.ENUM("activo", "inactivo"),
      allowNull: false,
      defaultValue: "activo",
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
    tableName: "personas",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    paranoid: true,
    freezeTableName: true,
  }
);

export default Persona;