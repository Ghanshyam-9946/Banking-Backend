require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});

// Generic send email function
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend-Ledger" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("📨 Message sent:", info.messageId);
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
  }
};

// Registration Email
async function sendRegistrationEmail(userEmail, name) {
  const subject = "Welcome to Backend-Ledger!";
  const text = `Hi ${name},

Thank you for registering at Backend-Ledger. We're excited to have you on board!

Best regards,
Backend-Ledger Team`;

  const html = `
  <h2>Welcome ${name} 🎉</h2>
  <p>Thank you for registering at <b>Backend-Ledger</b>.</p>
  <p>We're excited to have you on board!</p>
  <br/>
  <p>Best regards,<br/>Backend-Ledger Team</p>
  `;

  await sendEmail(userEmail, subject, text, html);
}

// Transaction Success Email
async function sendTransactionEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Successful 💰";

  const text = `Hi ${name},

Your transaction of ₹${amount} to account ${toAccount} was successful.

Best regards,
Backend-Ledger Team`;

  const html = `
  <h2>Transaction Successful ✅</h2>
  <p>Hi ${name},</p>
  <p>Your transaction of <b>₹${amount}</b> to account <b>${toAccount}</b> was successful.</p>
  <br/>
  <p>Best regards,<br/>Backend-Ledger Team</p>
  `;

  await sendEmail(userEmail, subject, text, html);
}

// Transaction Failed Email
async function sendTransactionEmailFail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Failed ❌";

  const text = `Hi ${name},

Your transaction of ₹${amount} to account ${toAccount} has failed.

Please check your balance and try again.

Best regards,
Backend-Ledger Team`;

  const html = `
  <h2>Transaction Failed ❌</h2>
  <p>Hi ${name},</p>
  <p>Your transaction of <b>₹${amount}</b> to account <b>${toAccount}</b> has failed.</p>
  <p>Please check your balance and try again.</p>
  <br/>
  <p>Best regards,<br/>Backend-Ledger Team</p>
  `;

  await sendEmail(userEmail, subject, text, html);
}

module.exports = {
  sendRegistrationEmail,
  sendTransactionEmail,
  sendTransactionEmailFail,
};