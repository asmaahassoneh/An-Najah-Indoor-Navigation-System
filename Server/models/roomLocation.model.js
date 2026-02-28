const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const RoomLocation = sequelize.define(
  "RoomLocation",
  {
    floorId: { type: DataTypes.INTEGER, allowNull: false },
    roomCode: { type: DataTypes.STRING, allowNull: false },
    x: { type: DataTypes.FLOAT, allowNull: false },
    y: { type: DataTypes.FLOAT, allowNull: false },
  },
  {
    indexes: [{ unique: true, fields: ["floorId", "roomCode"] }],
  },
);

module.exports = RoomLocation;
