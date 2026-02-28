const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const MapNode = sequelize.define("MapNode", {
  floorId: { type: DataTypes.INTEGER, allowNull: false },
  x: { type: DataTypes.FLOAT, allowNull: false },
  y: { type: DataTypes.FLOAT, allowNull: false },
  label: { type: DataTypes.STRING, allowNull: true },
});

module.exports = MapNode;
