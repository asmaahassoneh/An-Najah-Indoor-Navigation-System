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
    const floorId = Number(req.body.floorId);
    const fromNodeId = Number(req.body.fromNodeId);
    const toNodeId = Number(req.body.toNodeId);

    if (!floorId || !fromNodeId || !toNodeId) {
      return res
        .status(400)
        .json({ error: "floorId, fromNodeId, toNodeId are required" });
    }

    const from = await MapNode.findOne({ where: { id: fromNodeId, floorId } });
    const to = await MapNode.findOne({ where: { id: toNodeId, floorId } });

    if (!from || !to) {
      return res.status(404).json({
        error: "Node(s) not found on this floor",
        debug: { floorId, fromNodeId, toNodeId },
      });
    }

    const cost = dist(from, to);
    const edge = await MapEdge.create({ floorId, fromNodeId, toNodeId, cost });
    return res.status(201).json(edge);
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
  static async clearFloorGraph(req, res) {
    const { floorId } = req.params;

    try {
      await MapEdge.destroy({ where: { floorId } });
      await MapNode.destroy({ where: { floorId } });

      return res.json({ message: "Floor graph cleared" });
    } catch (err) {
      return res.status(500).json({ error: "Failed to clear floor graph" });
    }
  }
  static async deleteFloor(req, res) {
    const floorId = Number(req.params.id);

    if (!floorId) return res.status(400).json({ error: "Invalid floor id" });

    await MapEdge.destroy({ where: { floorId } });
    await MapNode.destroy({ where: { floorId } });
    await RoomLocation.destroy({ where: { floorId } });

    const deleted = await Floor.destroy({ where: { id: floorId } });

    if (!deleted) return res.status(404).json({ error: "Floor not found" });

    return res.json({ message: "Floor deleted ✅" });
  }

  static async getRoomLocation(req, res) {
    try {
      const { roomCode } = req.params;

      if (!roomCode) {
        return res.status(400).json({ error: "roomCode is required" });
      }

      const loc = await RoomLocation.findOne({
        where: { roomCode: String(roomCode).trim() },
      });

      if (!loc) {
        return res.status(404).json({ error: "Room location not found" });
      }

      return res.json({
        roomCode: loc.roomCode,
        floorId: loc.floorId,
        x: loc.x,
        y: loc.y,
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // GET /api/maps/route-multi?fromFloorId=1&fromX=100&fromY=200&toRoom=111170&prefer=elevator
  static async routeMulti(req, res) {
    try {
      const { fromFloorId, fromX, fromY, toRoom, prefer } = req.query;

      if (!fromFloorId || fromX == null || fromY == null || !toRoom) {
        return res.status(400).json({
          error: "fromFloorId, fromX, fromY, toRoom are required",
        });
      }

      const startFloorId = Number(fromFloorId);
      const startPoint = { x: Number(fromX), y: Number(fromY) };
      const roomCode = String(toRoom).trim();

      const room = await RoomLocation.findOne({ where: { roomCode } });
      if (!room) {
        return res.status(404).json({ error: "Room location not found" });
      }

      const targetFloorId = Number(room.floorId);
      const goalPoint = { x: Number(room.x), y: Number(room.y) };

      if (startFloorId === targetFloorId) {
        const nodes = await MapNode.findAll({
          where: { floorId: startFloorId },
        });
        const edges = await MapEdge.findAll({
          where: { floorId: startFloorId },
        });

        if (!nodes.length)
          return res
            .status(400)
            .json({ error: "No graph nodes on this floor" });

        const startNode = nearestNode(nodes, startPoint);
        const goalNode = nearestNode(nodes, goalPoint);

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
          mode: "single-floor",
          totalCost: result.cost,
          segments: [
            {
              floorId: startFloorId,
              instruction: `Stay on this floor and continue to room ${roomCode}.`,
              points,
            },
          ],
        });
      }

      const [nodesA, edgesA, nodesB, edgesB] = await Promise.all([
        MapNode.findAll({ where: { floorId: startFloorId } }),
        MapEdge.findAll({ where: { floorId: startFloorId } }),
        MapNode.findAll({ where: { floorId: targetFloorId } }),
        MapEdge.findAll({ where: { floorId: targetFloorId } }),
      ]);

      if (!nodesA.length)
        return res.status(400).json({ error: "No graph nodes on start floor" });
      if (!nodesB.length)
        return res
          .status(400)
          .json({ error: "No graph nodes on destination floor" });

      const isConnector = (n) => n.type === "stairs" || n.type === "elevator";

      const connectorsA = nodesA
        .filter(isConnector)
        .filter((n) => String(n.label || "").trim());
      const connectorsB = nodesB
        .filter(isConnector)
        .filter((n) => String(n.label || "").trim());

      if (!connectorsA.length || !connectorsB.length) {
        return res.status(400).json({
          error:
            "No stairs/elevator connectors with labels found on one of the floors",
        });
      }

      const keyOf = (n) => `${n.type}::${String(n.label).trim().toUpperCase()}`;

      const mapB = new Map();
      for (const n of connectorsB) mapB.set(keyOf(n), n);

      const pairs = [];
      for (const a of connectorsA) {
        const b = mapB.get(keyOf(a));
        if (b) pairs.push({ a, b });
      }

      if (!pairs.length) {
        return res.status(400).json({
          error:
            "No matching connector labels between the two floors (ex: E1 exists on both floors)",
        });
      }

      const startNodeA = nearestNode(nodesA, startPoint);
      const goalNodeB = nearestNode(nodesB, goalPoint);

      const byIdA = new Map(nodesA.map((n) => [n.id, n]));
      const byIdB = new Map(nodesB.map((n) => [n.id, n]));

      const preferType =
        String(prefer || "")
          .trim()
          .toLowerCase() === "stairs"
          ? "stairs"
          : String(prefer || "")
                .trim()
                .toLowerCase() === "elevator"
            ? "elevator"
            : null;

      const VERTICAL_COST = {
        stairs: 80,
        elevator: 40,
      };

      let best = null;

      for (const { a, b } of pairs) {
        const r1 = astar(nodesA, edgesA, startNodeA.id, a.id);
        if (!r1.path.length || !Number.isFinite(r1.cost)) continue;

        const r2 = astar(nodesB, edgesB, b.id, goalNodeB.id);
        if (!r2.path.length || !Number.isFinite(r2.cost)) continue;

        let vCost = VERTICAL_COST[a.type] ?? 60;

        if (preferType && a.type !== preferType) vCost += 30;

        const total = r1.cost + vCost + r2.cost;

        if (!best || total < best.totalCost) {
          best = { a, b, r1, r2, vCost, totalCost: total };
        }
      }

      if (!best) {
        return res
          .status(400)
          .json({ error: "No route found via available connectors" });
      }

      const points1 = best.r1.path.map((id) => ({
        x: byIdA.get(id).x,
        y: byIdA.get(id).y,
      }));
      points1.unshift({ x: startPoint.x, y: startPoint.y });

      const points2 = best.r2.path.map((id) => ({
        x: byIdB.get(id).x,
        y: byIdB.get(id).y,
      }));
      points2.push({ x: goalPoint.x, y: goalPoint.y });

      const connectorLabel = String(best.a.label).trim();

      return res.json({
        mode: "multi-floor",
        totalCost: best.totalCost,
        connector: {
          type: best.a.type,
          label: connectorLabel,
          verticalCost: best.vCost,
        },
        segments: [
          {
            floorId: startFloorId,
            instruction: `Go to ${best.a.type.toUpperCase()} ${connectorLabel}.`,
            points: points1,
          },
          {
            floorId: targetFloorId,
            instruction: `Exit ${best.b.type.toUpperCase()} ${connectorLabel} and continue to room ${roomCode}.`,
            points: points2,
          },
        ],
        from: { floorId: startFloorId, x: startPoint.x, y: startPoint.y },
        to: {
          floorId: targetFloorId,
          roomCode,
          x: goalPoint.x,
          y: goalPoint.y,
        },
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
}

module.exports = MapsController;
