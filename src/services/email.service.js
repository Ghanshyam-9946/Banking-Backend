require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },

  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000
});
transporter.verify((err, success) => {
  if (err) {
    console.log("SMTP Error:", err);
  } else {
    console.log("SMTP Ready");
  }
});

async function sendRegistrationEmail(userEmail, name) {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Welcome to Backend Ledger",
      html: `<h2>Hello ${name}</h2><p>Your account is created successfully.</p>`
    });

    console.log("Email sent:", info.messageId);
  } catch (err) {
    console.log("Email error:", err);
  }
}

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Transaction Successful",
      html: `<p>Hello ${name}</p>
             <p>Your transaction of ₹${amount} to account ${toAccount} was successful.</p>`
    });

    console.log("Email sent:", info.messageId);
  } catch (err) {
    console.log("Email error:", err);
  }
}

module.exports = {
  sendRegistrationEmail,
  sendTransactionEmail
};