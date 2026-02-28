const {
  Floor,
  RoomLocation,
  MapNode,
  MapEdge,
} = require("../models/associations");
const { astar, dist } = require("../utils/astar");

function nearestNode(nodes, point) {
  let best = null;
  let bestD = Infinity;
  for (const n of nodes) {
    const d = dist(n, point);
    if (d < bestD) {
      bestD = d;
      best = n;
    }
  }
  return best;
}

class MapsController {

  static async getFloors(req, res) {
    try {
      const floors = await Floor.findAll({ order: [["id", "ASC"]] });
      return res.json(floors);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  static async getFloorRooms(req, res) {
    try {
      const { floorId } = req.params;
      const rooms = await RoomLocation.findAll({
        where: { floorId: Number(floorId) },
        order: [["roomCode", "ASC"]],
      });
      return res.json(rooms);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  static async getFloorGraph(req, res) {
    try {
      const { floorId } = req.params;

      const nodes = await MapNode.findAll({
        where: { floorId: Number(floorId) },
        order: [["id", "ASC"]],
      });

      const edges = await MapEdge.findAll({
        where: { floorId: Number(floorId) },
        order: [["id", "ASC"]],
      });

      return res.json({ nodes, edges });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // GET /api/maps/route?floorId=1&fromX=100&fromY=200&toRoom=111170
  static async routeToRoom(req, res) {
    try {
      const { floorId, fromX, fromY, toRoom } = req.query;

      if (!floorId || !toRoom || fromX == null || fromY == null) {
        return res
          .status(400)
          .json({ error: "floorId, fromX, fromY, toRoom are required" });
      }

      const floorIdNum = Number(floorId);
      const startPoint = { x: Number(fromX), y: Number(fromY) };

      const room = await RoomLocation.findOne({
        where: { floorId: floorIdNum, roomCode: String(toRoom) },
      });

      if (!room) {
        return res.status(404).json({ error: "Room location not found" });
      }

      const nodes = await MapNode.findAll({ where: { floorId: floorIdNum } });
      const edges = await MapEdge.findAll({ where: { floorId: floorIdNum } }); 

      if (!nodes.length) {
        return res.status(400).json({ error: "No graph nodes on this floor" });
      }

      const goalPoint = { x: room.x, y: room.y };

      const startNode = nearestNode(nodes, startPoint);
      const goalNode = nearestNode(nodes, goalPoint);

      if (!startNode || !goalNode) {
        return res.status(400).json({ error: "Cannot find nearest nodes" });
      }

      const result = astar(nodes, edges, startNode.id, goalNode.id);

      if (!result.path.length || !Number.isFinite(result.cost)) {
        return res.status(400).json({ error: "No route found" });
      }

      const byId = new Map(nodes.map((n) => [n.id, n]));
      const points = result.path.map((id) => ({
        x: byId.get(id).x,
        y: byId.get(id).y,
      }));

      points.unshift({ x: startPoint.x, y: startPoint.y });
      points.push({ x: goalPoint.x, y: goalPoint.y });

      return res.json({
        from: { x: startPoint.x, y: startPoint.y },
        to: { roomCode: room.roomCode, x: room.x, y: room.y },
        points,
        cost: result.cost,
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }


  static async createFloor(req, res) {
    try {
      const { key, name, faculty, imageUrl, width, height } = req.body;

      if (!key || !name || !imageUrl || !width || !height) {
        return res
          .status(400)
          .json({ error: "key, name, imageUrl, width, height are required" });
      }

      const floor = await Floor.create({
        key,
        name,
        faculty: faculty || null,
        imageUrl,
        width: Number(width),
        height: Number(height),
      });

      return res.status(201).json(floor);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  static async upsertRoomLocation(req, res) {
    try {
      const { floorId } = req.params;
      const { roomCode, x, y } = req.body;

      if (!roomCode || x == null || y == null) {
        return res.status(400).json({ error: "roomCode, x, y are required" });
      }

      const floorIdNum = Number(floorId);
      const code = String(roomCode).trim();

      const existing = await RoomLocation.findOne({
        where: { floorId: floorIdNum, roomCode: code },
      });

      if (existing) {
        await existing.update({ x: Number(x), y: Number(y) });
        return res.json(existing);
      }

      const created = await RoomLocation.create({
        floorId: floorIdNum,
        roomCode: code,
        x: Number(x),
        y: Number(y),
      });

      return res.status(201).json(created);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  static async createNode(req, res) {
    try {
      const { floorId, x, y, label, type } = req.body;

      if (!floorId || x == null || y == null) {
        return res.status(400).json({ error: "floorId, x, y are required" });
      }

      const node = await MapNode.create({
        floorId: Number(floorId),
        x: Number(x),
        y: Number(y),
        label: label || null,
        type: type || "hall",
      });

      return res.status(201).json(node);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  static async deleteNode(req, res) {
    try {
      const { id } = req.params;

      await MapNode.destroy({ where: { id: Number(id) } });
      await MapEdge.destroy({ where: { fromNodeId: Number(id) } });
      await MapEdge.destroy({ where: { toNodeId: Number(id) } });

      return res.json({ message: "Node deleted" });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  static async createEdge(req, res) {
    try {
      const { floorId, fromNodeId, toNodeId } = req.body;

      if (!floorId || !fromNodeId || !toNodeId) {
        return res
          .status(400)
          .json({ error: "floorId, fromNodeId, toNodeId are required" });
      }

      const floorIdNum = Number(floorId);

      const from = await MapNode.findOne({
        where: { id: Number(fromNodeId), floorId: floorIdNum },
      });

      const to = await MapNode.findOne({
        where: { id: Number(toNodeId), floorId: floorIdNum },
      });

      if (!from || !to) {
        return res
          .status(404)
          .json({ error: "Node(s) not found on this floor" });
      }

      const cost = dist(from, to);

      const edge = await MapEdge.create({
        floorId: floorIdNum,
        fromNodeId: Number(fromNodeId),
        toNodeId: Number(toNodeId),
        cost,
      });

      return res.status(201).json(edge);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  static async deleteEdge(req, res) {
    try {
      const { id } = req.params;
      await MapEdge.destroy({ where: { id: Number(id) } });
      return res.json({ message: "Edge deleted" });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
}

module.exports = MapsController;
