const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const PasswordReset = sequelize.define("PasswordReset", {
  email: { type: DataTypes.STRING, allowNull: false },
  codeHash: { type: DataTypes.STRING, allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  usedAt: { type: DataTypes.DATE, allowNull: true },
  attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
});

module.exports = PasswordReset;
