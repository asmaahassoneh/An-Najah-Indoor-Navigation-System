const PasswordResetService = require("../services/passwordReset.service");

class PasswordResetController {
  static async request(req, res) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: "Email is required" });

      const result = await PasswordResetService.requestCode(email);
      return res.json(result);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  static async reset(req, res) {
    try {
      const { email, code, newPassword } = req.body;
      if (!email || !code || !newPassword) {
        return res
          .status(400)
          .json({ error: "Email, code, and newPassword are required" });
      }

      const result = await PasswordResetService.resetPassword({
        email,
        code,
        newPassword,
      });
      return res.json(result);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }
}

module.exports = PasswordResetController;
