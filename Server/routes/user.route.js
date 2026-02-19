const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user.controller");


router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/logout/:id", UserController.logout);

router.get("/", UserController.getAll); 
router.get("/id/:id", UserController.getById); 
router.get("/name/:username", UserController.getByName); 
router.get("/email/:email", UserController.getByEmail); 
router.get("/role/:role", UserController.getByRole); 

router.put("/change-password/:id", UserController.changePassword);
router.put("/id/:id", UserController.updateById); 
router.put("/email/:email", UserController.updateByEmail); 

router.delete("/id/:id", UserController.deleteById); 
router.delete("/", UserController.deleteAll); 

module.exports = router;
