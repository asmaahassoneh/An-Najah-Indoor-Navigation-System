const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const bcrypt = require("bcrypt");

const User = sequelize.define(
  "User",
  {
    username: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM("admin", "student", "guest", "professor"),
      allowNull: false,
      defaultValue: "guest",
    },
    login: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Rooms",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    hasRoom: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const hashed = await bcrypt.hash(user.password, 10);
          user.password = hashed;
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const hashed = await bcrypt.hash(user.password, 10);
          user.password = hashed;
        }
      },
    },
  },
);

module.exports = User;
