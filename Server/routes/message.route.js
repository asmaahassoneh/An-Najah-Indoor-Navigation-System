const express = require("express");
const MessageController = require("../controllers/message.controller");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.post("/", MessageController.send);
router.get("/inbox", MessageController.getInbox);
router.get("/conversation/:userId", MessageController.getConversation);
router.put("/conversation/:userId/read", MessageController.markRead);
router.delete("/conversation/:userId", MessageController.deleteConversation);

module.exports = router;
