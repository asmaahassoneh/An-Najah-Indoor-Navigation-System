const User = require("./user.model");
const Room = require("./room.model");
const ScheduleItem = require("./scheduleItem.model");

Room.hasMany(User, { foreignKey: "roomId" });
User.belongsTo(Room, { foreignKey: "roomId" });

User.hasMany(ScheduleItem, { foreignKey: "userId", onDelete: "CASCADE" });
ScheduleItem.belongsTo(User, { foreignKey: "userId" });

module.exports = { User, Room, ScheduleItem };
