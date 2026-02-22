const express = require("express");
const router = express.Router();
const RoomController = require("../controllers/room.controller");
const { requireAuth, requireRole } = require("../middleware/auth");


router.get("/", RoomController.getAll);
router.get("/search", RoomController.search);
router.get("/id/:id", RoomController.getById);
router.get("/code/:code", RoomController.getByCode);


router.post("/", requireAuth, requireRole("admin"), RoomController.create);
router.put(
  "/id/:id",
  requireAuth,
  requireRole("admin"),
  RoomController.updateById,
);
router.delete(
  "/id/:id",
  requireAuth,
  requireRole("admin"),
  RoomController.deleteById,
);
router.delete("/", requireAuth, requireRole("admin"), RoomController.deleteAll);

module.exports = router;
