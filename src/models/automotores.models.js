import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Automotor = sequelize.define(
  "Automotor",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    placa: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
    },
    vin: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    numero_motor: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    numero_chasis: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    marca: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    linea: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    modelo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    clase: {
      type: DataTypes.ENUM("AUTOMOVIL", "MOTOCICLETA", "CAMIONETA", "CAMPERO", "BUS", "CAMION"),
      allowNull: false,
    },
    servicio: {
      type: DataTypes.ENUM("PARTICULAR", "PUBLICO", "OFICIAL"),
      allowNull: false,
      defaultValue: "PARTICULAR",
    },
    propietario_documento: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    propietario_nombre: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM("activo", "inactivo", "inmovilizado"),
      allowNull: false,
      defaultValue: "activo",
    },
    condicion: {
      type: DataTypes.ENUM("LEGAL", "REPORTADO_ROBO", "RECUPERADO", "EMBARGADO"),
      allowNull: false,
      defaultValue: "LEGAL",
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "automotores",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    paranoid: true,
    freezeTableName: true,
    // ── Índices críticos ──────────────────────────────────────────────────────
    indexes: [
      // propietario_documento: consulta más frecuente (mis vehículos)
      { fields: ["propietario_documento"] },
      // placa: búsqueda por placa (comparendos, inmovilización)
      // placa ya tiene UNIQUE constraint, pero un índice explícito
      // lo hace visible para Sequelize sync y mejora el query planner
      { fields: ["placa"] },
      // estado: filtros activo/inactivo/inmovilizado
      { fields: ["estado"] },
      // condicion: filtros LEGAL/REPORTADO_ROBO/etc.
      { fields: ["condicion"] },
      // Compuesto: vehículos activos de un propietario (query más común)
      { fields: ["propietario_documento", "estado"] },
    ],
  }
);

export default Automotor;