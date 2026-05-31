const nodemailer = require('nodemailer');
const logger = require('../config/logger');

// Create a transporter using SMTP credentials from .env
// If no credentials are provided, we will log the email to console for development
let transporter = null;

if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
} else {
  logger.warn('📧 SMTP credentials not found in .env. Emails will be logged to console instead of sent.');
}

/**
 * Sends a welcome email to the newly registered user.
 * @param {string} email - The recipient email address
 * @param {string} name - The recipient's name
 */
async function sendWelcomeEmail(email, name) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"LUMI AI" <no-reply@lumi-ai.com>',
    to: email,
    subject: 'Welcome to LUMI AI',
    text: `Hello ${name},\n\nWelcome to LUMI AI! We are thrilled to have you on board.\n\nLUMI is your intelligent automotive reasoning engine, built to help you decode VINs, analyze vehicle history, and manage your fleet seamlessly.\n\nBest,\nThe Achtrex Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #18181B;">
        <h2 style="color: #0D2FA3;">Welcome to LUMI AI, ${name}!</h2>
        <p>We are thrilled to have you on board.</p>
        <p>LUMI is your intelligent automotive reasoning engine, built to help you decode VINs, analyze vehicle history, and manage your fleet seamlessly.</p>
        <br />
        <p>Best regards,<br/><strong>The Achtrex Team</strong></p>
      </div>
    `
  };

  try {
    if (transporter) {
      const info = await transporter.sendMail(mailOptions);
      logger.info(`📧 Welcome email sent to ${email} [Message ID: ${info.messageId}]`);
    } else {
      logger.info(`📧 (MOCK) Welcome email sent to ${email}`);
      console.log(mailOptions.text);
    }
    return true;
  } catch (error) {
    logger.error(`❌ Failed to send welcome email to ${email}:`, error.message);
    return false;
  }
}

module.exports = {
  sendWelcomeEmail
};
