const express = require("express");
const PasswordResetController = require("../controllers/passwordReset.controller");
const router = express.Router();

const UserController = require("../controllers/user.controller");
const {
  requireAuth,
  requireRole,
  requireSelfOrRole,
} = require("../middleware/auth");

router.post("/forgot-password", PasswordResetController.request);
router.post("/reset-password-with-code", PasswordResetController.reset);

router.post("/register", UserController.register);
router.post("/login", UserController.login);

router.use(requireAuth);

router.post("/logout/:id", requireSelfOrRole("admin"), UserController.logout);

router.get("/", requireRole("admin"), UserController.getAll);
router.get("/id/:id", requireSelfOrRole("admin"), UserController.getById);

router.get("/name/:username", requireRole("admin"), UserController.getByName);
router.get("/email/:email", requireRole("admin"), UserController.getByEmail);
router.get("/role/:role", requireRole("admin"), UserController.getByRole);

router.put(
  "/change-password/:id",
  requireSelfOrRole("admin"),
  UserController.changePassword,
);

router.put("/id/:id", requireSelfOrRole("admin"), UserController.updateById);

router.put("/email/:email", requireRole("admin"), UserController.updateByEmail);

router.delete("/", requireAuth, requireRole("admin"), UserController.deleteAll);
router.delete(
  "/id/:id",
  requireAuth,
  requireRole("admin"),
  UserController.deleteById,
);
module.exports = router;
