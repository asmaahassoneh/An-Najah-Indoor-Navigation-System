const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Room = sequelize.define("Room", {
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  type: {
    type: DataTypes.ENUM("lecture", "lab", "office", "bathroom", "other"),
    allowNull: false,
    defaultValue: "other",
  },
  // x: { type: DataTypes.FLOAT, allowNull: true },
  // y: { type: DataTypes.FLOAT, allowNull: true },
});

module.exports = Room;
