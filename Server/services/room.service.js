const { Op } = require("sequelize");
const Room = require("../models/room.model");
const { extractFloor, extractFaculty } = require("../utils/roomCode");

class RoomService {
  static normalizeCode(code) {
    return String(code || "")
      .trim()
      .toUpperCase();
  }

  static withComputedFields(roomInstance) {
    const json = roomInstance.toJSON();
    return {
      ...json,
      floor: extractFloor(json.code),
      faculty: extractFaculty(json.code),
    };
  }

  static async createRoom({ code, type }) {
    try {
      if (!code) throw new Error("Room code is required");

      const normalizedCode = this.normalizeCode(code);

      const existing = await Room.findOne({ where: { code: normalizedCode } });
      if (existing) throw new Error("Room already exists");

      const room = await Room.create({ code: normalizedCode, type });
      return this.withComputedFields(room);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getAllRooms() {
    try {
      const rooms = await Room.findAll({ order: [["id", "ASC"]] });
      return rooms.map((r) => this.withComputedFields(r));
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getRoomById(id) {
    try {
      const room = await Room.findByPk(id);
      if (!room) throw new Error("Room not found");

      return this.withComputedFields(room);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getRoomByCode(code) {
    try {
      const normalizedCode = this.normalizeCode(code);

      const room = await Room.findOne({ where: { code: normalizedCode } });
      if (!room) throw new Error("Room not found");

      return this.withComputedFields(room);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async searchRooms(q) {
    try {
      const query = String(q || "").trim();
      if (!query) return [];

      const rooms = await Room.findAll({
        where: {
          [Op.or]: [
            { code: { [Op.iLike]: `%${query}%` } },
            { type: { [Op.iLike]: `%${query}%` } },
          ],
        },
        order: [["id", "ASC"]],
      });

      return rooms.map((r) => this.withComputedFields(r));
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async updateRoomById(id, updatedData) {
    try {
      const payload = { ...updatedData };
      if (payload.code) payload.code = this.normalizeCode(payload.code);

      const [rows, [updatedRoom]] = await Room.update(payload, {
        where: { id },
        returning: true,
      });

      if (!updatedRoom) throw new Error("Room not found");

      return this.withComputedFields(updatedRoom);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async deleteRoomById(id) {
    try {
      const deleted = await Room.destroy({ where: { id } });
      if (!deleted) throw new Error("Room not found");
      return deleted;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async deleteAllRooms() {
    try {
      return await Room.destroy({ where: {} });
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = RoomService;
