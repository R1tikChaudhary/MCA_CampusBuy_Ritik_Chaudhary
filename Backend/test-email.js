const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
  },
});

const testEmail = async () => {
  console.log("Using Email:", process.env.SMTP_EMAIL);
  console.log("Using Pass:", process.env.SMTP_PASS ? "****" : "MISSING");
  
  try {
    console.log("Verifying transporter...");
    await transporter.verify();
    console.log("✅ Transporter is ready");

    console.log("Sending test email...");
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.SMTP_EMAIL, // Send to self for testing
      subject: "ITM Buy & Sell - Email Test",
      text: "This is a test email to verify nodemailer configuration.",
    });
    console.log("✅ Email sent successfully:", info.response);
    process.exit(0);
  } catch (err) {
    console.error("❌ Email test failed:", err);
    process.exit(1);
  }
};

testEmail();
