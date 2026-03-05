require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },

  // ⏱ Timeout settings
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000
});


// SMTP connection verify
transporter.verify(function (error, success) {
  if (error) {
    console.log("SMTP Error:", error);
  } else {
    console.log("SMTP Server is ready to send emails");
  }
});


async function sendEmail(to, subject, text, html) {
  try {

    const info = await transporter.sendMail({
      from: `"Backend-Ledger" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    });

    console.log("Message sent:", info.messageId);

  } catch (error) {

    console.log("Email send error:", error);

  }
}


async function sendRegistrationEmail(userEmail, name) {

  const subject = "Welcome to Backend-Ledger";

  const text = `Hi ${name}, Welcome to Backend-Ledger`;

  const html = `<h2>Hello ${name}</h2>
  <p>Welcome to Backend-Ledger</p>`;

  await sendEmail(userEmail, subject, text, html);

}


async function sendTransactionEmail(userEmail, name, amount, toAccount) {

  const subject = "Transaction Successful";

  const text = `Hi ${name}, your transaction of ₹${amount} to account ${toAccount} was successful`;

  const html = `<p>Hello ${name}</p>
  <p>Your transaction of ₹${amount} to account ${toAccount} was successful</p>`;

  await sendEmail(userEmail, subject, text, html);

}


module.exports = {
  sendRegistrationEmail,
  sendTransactionEmail
};