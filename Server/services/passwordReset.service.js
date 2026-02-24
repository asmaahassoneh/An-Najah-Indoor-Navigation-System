const crypto = require("crypto");
const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const PasswordReset = require("../models/passwordReset.model");
const { sendResetCodeEmail } = require("../utils/mailer");

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function sha256(str) {
  return crypto.createHash("sha256").update(str).digest("hex");
}

class PasswordResetService {
  static async requestCode(email) {
    const normalizedEmail = (email || "").trim().toLowerCase();

    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) return { message: "A code has been sent." };

    await PasswordReset.destroy({
      where: { email: normalizedEmail, usedAt: null },
    });

    const code = generateCode();
    const codeHash = await bcrypt.hash(code, 10);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await PasswordReset.create({
      email: normalizedEmail,
      codeHash,
      expiresAt,
      usedAt: null,
      attempts: 0,
    });

    await sendResetCodeEmail({ to: normalizedEmail, code });

    return { message: "A code has been sent." };
  }

  static async resetPassword({ email, code, newPassword }) {
    const normalizedEmail = (email || "").trim().toLowerCase();
    const c = (code || "").trim();

    const rec = await PasswordReset.findOne({
      where: { email: normalizedEmail, usedAt: null },
      order: [["createdAt", "DESC"]],
    });

    if (!rec) throw new Error("Invalid code or expired");
    if (rec.expiresAt.getTime() < Date.now()) throw new Error("Code expired");
    if (rec.attempts >= 5)
      throw new Error("Too many attempts, request a new code");

    const ok = await bcrypt.compare(c, rec.codeHash);
    if (!ok) {
      rec.attempts += 1;
      await rec.save();
      throw new Error("Invalid code");
    }

    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) throw new Error("Invalid code or expired");

    user.password = newPassword;
    await user.save();

    rec.usedAt = new Date();
    await rec.save();

    return { message: "Password reset successfully" };
  }
}

module.exports = PasswordResetService;
