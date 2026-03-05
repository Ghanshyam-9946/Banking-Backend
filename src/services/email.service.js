require("dotenv").config();
const nodemailer = require("nodemailer");
const dns = require("dns");

// Force IPv4 (fix for Render IPv6 SMTP issue)
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },

  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000
});

// Verify SMTP connection
transporter.verify((err, success) => {
  if (err) {
    console.log("❌ SMTP Error:", err);
  } else {
    console.log("✅ SMTP Ready");
  }
});

async function sendRegistrationEmail(userEmail, name) {
  try {

    console.log("Sending registration email to:", userEmail);

    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Welcome to Backend Ledger",
      html: `
        <h2>Hello ${name}</h2>
        <p>Your account is created successfully.</p>
      `
    });

    console.log("✅ Email sent:", info.messageId);

  } catch (err) {

    console.log("❌ Email error:", err);

  }
}

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
  try {

    console.log("Sending transaction email to:", userEmail);

    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Transaction Successful",
      html: `
        <p>Hello ${name}</p>
        <p>Your transaction of ₹${amount} to account ${toAccount} was successful.</p>
      `
    });

    console.log("✅ Email sent:", info.messageId);

  } catch (err) {

    console.log("❌ Email error:", err);

  }
}

module.exports = {
  sendRegistrationEmail,
  sendTransactionEmail
};