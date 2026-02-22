const UserService = require("../services/user.service");

class UserController {
  static async register(req, res) {
    try {
      const { username, email, password, roomId } = req.body;
      if (!username || !email || !password) {
        return res
          .status(400)
          .json({ error: "Username, email, and password are required" });
      }

      const user = await UserService.register({
        username,
        email,
        password,
        roomId,
      });

      return res.status(201).json({
        message: "User registered successfully",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          roomId: user.roomId || null,
        },
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res
          .status(400)
          .json({ error: "Email and password are required" });

      const { user, token } = await UserService.login({ email, password });

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async changePassword(req, res) {
    try {
      const { id } = req.params;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res
          .status(400)
          .json({ error: "Old and new password are required" });
      }

      const result = await UserService.changePassword(
        id,
        oldPassword,
        newPassword,
      );
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async logout(req, res) {
    try {
      const { id } = req.params;
      const result = await UserService.logout(id);
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const users = await UserService.getAllUsers(req.user.id);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateById(req, res) {
    try {
      const { id } = req.params;
      const updatedUser = await UserService.updateUserById(id, req.body);
      if (!updatedUser)
        return res.status(404).json({ error: "User not found" });
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateByEmail(req, res) {
    try {
      const { email } = req.params;
      const updatedUser = await UserService.updateUserByEmail(email, req.body);
      if (!updatedUser)
        return res.status(404).json({ error: "User not found" });
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteById(req, res) {
    try {
      const { id } = req.params;
      const result = await UserService.deleteUserById(id, req.user);
      if (!result) return res.status(404).json({ error: "User not found" });
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteAll(req, res) {
    try {
      const result = await UserService.deleteAllUsers();
      res.json({ message: `${result} user(s) deleted successfully` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getByName(req, res) {
    try {
      const { username } = req.params;
      const user = await UserService.getUserByName(username);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getByEmail(req, res) {
    try {
      const { email } = req.params;
      const user = await UserService.getUserByEmail(email);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getByRole(req, res) {
    try {
      const { role } = req.params;
      const users = await UserService.getUsersByRole(role);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = UserController;
