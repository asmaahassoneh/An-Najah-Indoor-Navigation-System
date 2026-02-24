const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Room = require("../models/room.model");
const { Op } = require("sequelize");

class UserService {
  static async register({ username, email, password, roomId }) {
    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() },
    });
    if (existingUser) throw new Error("Email already exists");

    const normalizedEmail = email.toLowerCase();

    let role = "guest";

    if (normalizedEmail === "asmaa.hassoneh04@gmail.com") role = "admin";
    else if (normalizedEmail.endsWith("@stu.najah.edu")) role = "student";
    else if (normalizedEmail.endsWith("@najah.edu")) role = "professor";

    const userData = { username, email: normalizedEmail, password, role };
    if (role === "professor") {
      if (roomId && String(roomId).trim()) {
        const code = String(roomId).trim().toUpperCase();

        const room = await Room.findOne({ where: { code } });
        if (!room) throw new Error("Room does not exist");

        userData.roomId = room.id;
      } else {
        userData.roomId = null;
      }
    }
    if (role === "professor" && userData.roomId) userData.hasRoom = true;

    return await User.create(userData);
  }

  static async login({ email, password }) {
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) throw new Error("User not found");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Invalid password");

    user.login = true;
    await user.save();

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return { user, token };
  }

  static async logout(id) {
    const user = await User.findByPk(id);
    if (!user) throw new Error("User not found");

    user.login = false;
    await user.save();

    return { message: "User logged out successfully" };
  }
  static async changePassword(id, oldPassword, newPassword) {
    const user = await User.findByPk(id);
    if (!user) throw new Error("User not found");

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) throw new Error("Old password is incorrect");

    user.password = newPassword;
    await user.save();

    return { message: "Password updated successfully" };
  }

  static async updateUserById(id, updatedData) {
    try {
      const allowed = ["username"];
      const payload = {};

      for (const key of allowed) {
        if (updatedData[key] !== undefined) payload[key] = updatedData[key];
      }

      const [rows, [updatedUser]] = await User.update(payload, {
        where: { id },
        returning: true,
      });

      return updatedUser;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async updateUserByEmail(email, updatedData) {
    try {
      if (updatedData.password) {
        updatedData.password = await bcrypt.hash(updatedData.password, 10);
      }

      const [rows, [updatedUser]] = await User.update(updatedData, {
        where: { email: email.toLowerCase() },
        returning: true,
      });

      return updatedUser;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async deleteUserById(id, currentUser) {
    const user = await User.findByPk(id);
    if (!user) throw new Error("User not found");

    if (user.role === "admin") {
      throw new Error("Cannot delete admin account");
    }

    if (Number(id) === Number(currentUser.id)) {
      throw new Error("You cannot delete your own account");
    }

    const result = await User.destroy({ where: { id } });
    return result;
  }
  static async deleteAllUsers() {
    try {
      const result = await User.destroy({
        where: { role: { [Op.ne]: "admin" } },
      });
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getUserById(id) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) throw new Error("User not found");
    return user;
  }

  static async getUserByName(username) {
    try {
      const user = await User.findOne({ where: { username } });
      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getUserByEmail(email) {
    try {
      const user = await User.findOne({
        where: { email: email.toLowerCase() },
      });
      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getUsersByRole(role) {
    try {
      const users = await User.findAll({ where: { role } });
      return users;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getAllUsers(currentUserId) {
    try {
      const users = await User.findAll({
        where: {
          id: { [Op.ne]: currentUserId },
        },
        attributes: { exclude: ["password"] },
        order: [["id", "ASC"]],
      });

      return users;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = UserService;
