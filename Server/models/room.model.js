const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const { extractFaculty, extractFloor } = require("../utils/roomCode");

const Room = sequelize.define(
  "Room",
  {
    code: { type: DataTypes.STRING, allowNull: false, unique: true },

    type: {
      type: DataTypes.ENUM("lecture", "lab", "office", "bathroom", "other"),
      allowNull: false,
      defaultValue: "other",
    },

    faculty: { type: DataTypes.STRING, allowNull: true },
    floor: { type: DataTypes.STRING, allowNull: true },
  },
  {
    hooks: {
      beforeValidate: (room) => {
        if (room.code) {
          room.faculty = extractFaculty(room.code);
          room.floor = extractFloor(room.code);
        }
      },
    },
  },
);

module.exports = Room;
