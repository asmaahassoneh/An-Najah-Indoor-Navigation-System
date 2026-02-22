const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const ScheduleItem = sequelize.define("ScheduleItem", {
  userId: { type: DataTypes.INTEGER, allowNull: false },

  courseCode: DataTypes.STRING,
  sectionCode: DataTypes.STRING,
  courseName: DataTypes.STRING,
  credits: DataTypes.INTEGER,

  day: DataTypes.STRING, 
  startTime: DataTypes.STRING,
  endTime: DataTypes.STRING,

  roomCode: DataTypes.STRING, 
  campus: DataTypes.STRING,
  instructor: DataTypes.STRING,

  totalAbsence: DataTypes.INTEGER,
  excusedAbsence: DataTypes.INTEGER,
  deprived: DataTypes.STRING,
});

module.exports = ScheduleItem;
