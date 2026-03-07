const { Op } = require("sequelize");
const { Message, User } = require("../models/associations");

class MessageService {
  static isAllowedChat(senderRole, receiverRole) {
    return (
      (senderRole === "student" && receiverRole === "professor") ||
      (senderRole === "professor" && receiverRole === "student")
    );
  }

  static async sendMessage({ senderId, receiverId, text }) {
    if (!text || !String(text).trim()) {
      throw new Error("Message text is required");
    }

    if (Number(senderId) === Number(receiverId)) {
      throw new Error("You cannot send a message to yourself");
    }

    const sender = await User.findByPk(senderId);
    const receiver = await User.findByPk(receiverId);

    if (!sender || !receiver) {
      throw new Error("Sender or receiver not found");
    }

    if (!this.isAllowedChat(sender.role, receiver.role)) {
      throw new Error("Chat is only allowed between professor and student");
    }

    const message = await Message.create({
      senderId,
      receiverId,
      text: String(text).trim(),
    });

    return message;
  }

  static async getConversation({ currentUserId, otherUserId }) {
    if (Number(currentUserId) === Number(otherUserId)) {
      throw new Error("Invalid conversation user");
    }

    const currentUser = await User.findByPk(currentUserId);
    const otherUser = await User.findByPk(otherUserId);

    if (!currentUser || !otherUser) {
      throw new Error("User not found");
    }

    if (!this.isAllowedChat(currentUser.role, otherUser.role)) {
      throw new Error("Chat is only allowed between professor and student");
    }

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId },
        ],
      },
      order: [["createdAt", "ASC"]],
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username", "email", "role"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["id", "username", "email", "role"],
        },
      ],
    });

    return messages;
  }

  static async getInbox(userId) {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [{ senderId: userId }, { receiverId: userId }],
      },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username", "email", "role"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["id", "username", "email", "role"],
        },
      ],
    });

    const map = new Map();

    for (const msg of messages) {
      const other =
        Number(msg.senderId) === Number(userId) ? msg.receiver : msg.sender;

      if (!other) continue;
      if (map.has(other.id)) continue;

      map.set(other.id, {
        user: other,
        lastMessage: msg,
      });
    }

    return Array.from(map.values());
  }

  static async markConversationRead({ currentUserId, otherUserId }) {
    await Message.update(
      { isRead: true },
      {
        where: {
          senderId: otherUserId,
          receiverId: currentUserId,
          isRead: false,
        },
      },
    );

    return { message: "Conversation marked as read" };
  }
}

module.exports = MessageService;
