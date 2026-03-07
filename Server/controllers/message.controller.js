const MessageService = require("../services/message.service");

class MessageController {
  static async send(req, res) {
    try {
      const senderId = req.user.id;
      const { receiverId, text } = req.body;

      if (!receiverId || !text) {
        return res
          .status(400)
          .json({ error: "receiverId and text are required" });
      }

      const message = await MessageService.sendMessage({
        senderId,
        receiverId: Number(receiverId),
        text,
      });

      return res.status(201).json({
        message: "Message sent successfully",
        data: message,
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async getConversation(req, res) {
    try {
      const currentUserId = req.user.id;
      const otherUserId = Number(req.params.userId);

      const messages = await MessageService.getConversation({
        currentUserId,
        otherUserId,
      });

      return res.json(messages);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async getInbox(req, res) {
    try {
      const inbox = await MessageService.getInbox(req.user.id);
      return res.json(inbox);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async markRead(req, res) {
    try {
      const currentUserId = req.user.id;
      const otherUserId = Number(req.params.userId);

      const result = await MessageService.markConversationRead({
        currentUserId,
        otherUserId,
      });

      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = MessageController;
