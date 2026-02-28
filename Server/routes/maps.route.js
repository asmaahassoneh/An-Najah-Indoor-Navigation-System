const express = require("express");
const MapsController = require("../controllers/maps.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/floors", requireAuth, MapsController.getFloors);
router.get("/floors/:floorId/graph", requireAuth, MapsController.getFloorGraph);
router.get("/floors/:floorId/rooms", requireAuth, MapsController.getFloorRooms);
router.get("/route", requireAuth, MapsController.routeToRoom);

router.post(
  "/floors",
  requireAuth,
  requireRole("admin"),
  MapsController.createFloor,
);

router.put(
  "/floors/:floorId/rooms",
  requireAuth,
  requireRole("admin"),
  MapsController.upsertRoomLocation,
);

router.post(
  "/nodes",
  requireAuth,
  requireRole("admin"),
  MapsController.createNode,
);
router.delete(
  "/nodes/:id",
  requireAuth,
  requireRole("admin"),
  MapsController.deleteNode,
);

router.post(
  "/edges",
  requireAuth,
  requireRole("admin"),
  MapsController.createEdge,
);
router.delete(
  "/edges/:id",
  requireAuth,
  requireRole("admin"),
  MapsController.deleteEdge,
);
router.delete(
  "/floors/:floorId/graph",
  requireAuth,
  requireRole("admin"),
  MapsController.clearFloorGraph,
);

module.exports = router;
