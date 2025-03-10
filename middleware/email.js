/* eslint-disable linebreak-style */
/* eslint-disable no-useless-catch */
import * as nodemailer from "nodemailer";
import config from "../config/config.js";

const transporter = nodemailer.createTransport({
  host: config.sesSmtpHost,
  port: config.sesSmtpPort,
  secure: false,
  auth: {
    user: config.sesSmtpUsername,
    pass: config.sesSmtpPassword,
  },
});

async function sendMail(toEmail, subject, html) {
  const message = {
    from: config.smtpFromEmail,
    to: toEmail,
    subject,
    html,
  };

  try {
    const mail = await transporter.sendMail(message);
    return mail;
  } catch (error) {
    throw error;
  }
}

export { sendMail };
