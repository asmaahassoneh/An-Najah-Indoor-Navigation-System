const RoomService = require("../services/room.service");

class RoomController {
  static async create(req, res) {
    try {
      const { code, type } = req.body;

      if (!code || !type) {
        return res.status(400).json({ error: "Code and type are required" });
      }

      const room = await RoomService.createRoom({ code, type });
      return res.status(201).json({ message: "Room created", room });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const rooms = await RoomService.getAllRooms();
      return res.json(rooms);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const room = await RoomService.getRoomById(id);
      return res.json(room);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  }

  static async getByCode(req, res) {
    try {
      const { code } = req.params;
      const room = await RoomService.getRoomByCode(code);
      return res.json(room);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  }

  static async search(req, res) {
    try {
      const { q } = req.query;
      const results = await RoomService.searchRooms(q);
      return res.json(results);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async updateById(req, res) {
    try {
      const { id } = req.params;
      const room = await RoomService.updateRoomById(id, req.body);
      return res.json({ message: "Room updated", room });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async deleteById(req, res) {
    try {
      const { id } = req.params;
      await RoomService.deleteRoomById(id);
      return res.json({ message: "Room deleted successfully" });
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  }

  static async deleteAll(req, res) {
    try {
      const result = await RoomService.deleteAllRooms();
      return res.json({ message: `${result} room(s) deleted successfully` });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = RoomController;
