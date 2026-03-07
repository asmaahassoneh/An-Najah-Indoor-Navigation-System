const User = require("./user.model");
const Room = require("./room.model");
const ScheduleItem = require("./scheduleItem.model");
const RoomLocation = require("./roomLocation.model");
const Floor = require("./floor.model");
const MapNode = require("./mapNode.model");
const MapEdge = require("./mapEdge.model");
const Message = require("./message.model");

Room.hasMany(User, { foreignKey: "roomId" });
User.belongsTo(Room, { foreignKey: "roomId" });

User.hasMany(ScheduleItem, { foreignKey: "userId", onDelete: "CASCADE" });
ScheduleItem.belongsTo(User, { foreignKey: "userId" });

Floor.hasMany(RoomLocation, { foreignKey: "floorId", onDelete: "CASCADE" });
RoomLocation.belongsTo(Floor, { foreignKey: "floorId" });

Room.hasOne(RoomLocation, { foreignKey: "roomId", onDelete: "CASCADE" });
RoomLocation.belongsTo(Room, { foreignKey: "roomId" });

Floor.hasMany(MapNode, { foreignKey: "floorId", onDelete: "CASCADE" });
MapNode.belongsTo(Floor, { foreignKey: "floorId" });

Floor.hasMany(MapEdge, { foreignKey: "floorId", onDelete: "CASCADE" });
MapEdge.belongsTo(Floor, { foreignKey: "floorId" });

MapNode.hasMany(MapEdge, { foreignKey: "fromNodeId", onDelete: "CASCADE" });
MapNode.hasMany(MapEdge, { foreignKey: "toNodeId", onDelete: "CASCADE" });

User.hasMany(Message, { foreignKey: "senderId", as: "sentMessages" });
User.hasMany(Message, { foreignKey: "receiverId", as: "receivedMessages" });

Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });
Message.belongsTo(User, { foreignKey: "receiverId", as: "receiver" });

module.exports = {
  User,
  Room,
  ScheduleItem,
  Floor,
  RoomLocation,
  MapNode,
  MapEdge,
  Message,
};
