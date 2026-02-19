const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class UserService {
  static async register({ username, email, password, room }) {
    try {
      const existingUser = await User.findOne({
        where: { email: email.toLowerCase() },
      });
      if (existingUser) throw new Error("Email already exists");

      let role = "guest"; 


      if (email === "asmaa.hassoneh04@gmail.com") role = "admin";
      else if (email.endsWith("stu.najah.edu")) role = "student";
      else if (email.endsWith("@najah.edu")) role = "professor";
      else role = "guest";

      const userData = { username, email: email.toLowerCase(), password, role };
      if (role === "professor" && room) userData.room = room;

      const newUser = await User.create(userData);
      return newUser;
    } catch (error) {
      throw new Error(error.message);
    }
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
      if (updatedData.password) {
        updatedData.password = await bcrypt.hash(updatedData.password, 10);
      }

      const [rows, [updatedUser]] = await User.update(updatedData, {
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

  static async deleteUserById(id) {
    try {
      const result = await User.destroy({ where: { id } });
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async deleteAllUsers() {
    try {
      const result = await User.destroy({ where: {} });
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getUserById(id) {
    const user = await User.findByPk(id);
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

  static async getAllUsers() {
    try {
      const users = await User.findAll();
      return users;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = UserService;
