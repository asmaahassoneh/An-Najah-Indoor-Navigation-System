const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const MapEdge = sequelize.define("MapEdge", {
  floorId: { type: DataTypes.INTEGER, allowNull: false },
  fromNodeId: { type: DataTypes.INTEGER, allowNull: false },
  toNodeId: { type: DataTypes.INTEGER, allowNull: false },
  cost: { type: DataTypes.FLOAT, allowNull: false },
});

module.exports = MapEdge;
