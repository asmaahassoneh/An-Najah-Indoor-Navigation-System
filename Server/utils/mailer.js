const nodemailer = require("nodemailer");

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendResetCodeEmail({ to, code }) {
  const transporter = createTransporter();
  const appName = process.env.APP_NAME || "App";

  await transporter.sendMail({
    from: `"${appName}" <${process.env.SMTP_USER}>`,
    to,
    subject: `${appName} password reset code`,
    text: `Your reset code is: ${code}\nIt expires in 10 minutes.`,
  });
}

module.exports = { sendResetCodeEmail };
