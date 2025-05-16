const nodemailer = require("nodemailer");

const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
};

function generatePaymentReference() {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 10000);
  return `PAY${timestamp}${randomNum}`;
}

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send email verification link
async function sendVerificationLink(email, token) {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: "Verify Your Email",
    html: `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email address:</p>
      <p><a href="${verificationUrl}">Verify Email</a></p>
      <p>Or copy and paste this link in your browser:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>This link expires in 24 hours.</p>
      <p>If you did not request this verification, please ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
      return false;
    } else {
      console.log("Verification email sent:", info.response);
      return true;
    }
  });
}

async function sendGetStarted(email) {
  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: "Welcome to Xcoin-Transfer",
    html: `
      <h1>Welcome to Xcoin-Transfer!</h1>
      <p>Thank you for creating an account with us.</p>
      <p>We're excited to have you on board. With Xcoin-Transfer, you can:</p>
      <ul>
        <li>Send and receive money securely</li>
        <li>Track your transactions</li>
        <li>Manage your digital assets</li>
      </ul>
      <p>If you need any assistance, please don't hesitate to contact our support team.</p>
      <p>Best regards,</p>
      <p>The Xcoin-Transfer Team</p>
    `,
  };

  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
      return false;
    } else {
      console.log("Verification email sent:", info.response);
      return true;
    }
  });
}

module.exports = {
  sendGetStarted,
  isAuthenticated,
  generatePaymentReference,
  sendVerificationLink,
};
