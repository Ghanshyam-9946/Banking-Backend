require("dotenv").config();
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);


// Generic email sender
async function sendEmail(to, subject, html) {

  console.log("Sending email to:", to);

  try {

    const response = await resend.emails.send({
      from: "Backend Ledger <onboarding@resend.dev>",
      to: to,
      subject: subject,
      html: html
    });

    console.log("Email sent:", response);

  } catch (error) {

    console.log("Email error:", error);

  }

}


// Registration Email
async function sendRegistrationEmail(userEmail, name) {

  const subject = "Welcome to Backend-Ledger";

  const html = `
  <h2>Hello ${name} 👋</h2>
  <p>Welcome to <b>Backend Ledger</b>.</p>
  <p>Your account has been created successfully.</p>
  `;

  await sendEmail(userEmail, subject, html);

}


// Transaction Success Email
async function sendTransactionEmail(userEmail, name, amount, toAccount) {

  const subject = "Transaction Successful";

  const html = `
  <h2>Transaction Successful 💸</h2>
  <p>Hello ${name}</p>
  <p>Your transaction of <b>₹${amount}</b> to account <b>${toAccount}</b> was successful.</p>
  `;

  await sendEmail(userEmail, subject, html);

}


module.exports = {
  sendRegistrationEmail,
  sendTransactionEmail
};