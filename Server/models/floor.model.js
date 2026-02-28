const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Floor = sequelize.define("Floor", {
  key: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  faculty: { type: DataTypes.STRING, allowNull: true },
  imageUrl: { type: DataTypes.STRING, allowNull: false },
  width: { type: DataTypes.INTEGER, allowNull: false },
  height: { type: DataTypes.INTEGER, allowNull: false },
});

module.exports = Floor;
