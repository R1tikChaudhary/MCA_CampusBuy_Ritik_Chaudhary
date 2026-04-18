const nodemailer = require("nodemailer");
const Feedback = require("../models/Feedback");

// Feedback/Report Handler
exports.sendFeedback = async (req, res) => {
  const {
    name,
    email,
    rating,
    like,
    improve,
    feedbackType = "feedback",
    reportTargetType = "",
    reportTargetId = "",
  } = req.body;

  const normalizedType = feedbackType === "report" ? "report" : "feedback";
  const parsedRating = rating ? Number(rating) : null;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 5000, // 5 seconds
    greetingTimeout: 5000,
    socketTimeout: 5000,
  });

  const feedbackHtml = `
    <h2>New ${normalizedType === "report" ? "Report" : "Feedback"} Received</h2>
    <p><strong>Type:</strong> ${normalizedType}</p>
    <p><strong>Name:</strong> ${name || "Anonymous"}</p>
    <p><strong>Email:</strong> ${email || "Not provided"}</p>
    <p><strong>Rating:</strong> ${parsedRating || "N/A"}</p>
    <p><strong>Liked:</strong> ${like || "N/A"}</p>
    <p><strong>Suggestions to Improve / Report Details:</strong> ${improve || "N/A"}</p>
    ${
      normalizedType === "report"
        ? `<p><strong>Reported Target:</strong> ${reportTargetType || "other"} - ${reportTargetId || "N/A"}</p>`
        : ""
    }
  `;

  try {
    const feedback = await Feedback.create({
      name: name || "",
      email: email || "",
      rating: parsedRating,
      like: like || "",
      improve: improve || "",
      feedbackType: normalizedType,
      reportTargetType: normalizedType === "report" ? reportTargetType || "other" : "",
      reportTargetId: normalizedType === "report" ? reportTargetId || "" : "",
      reportStatus: "open",
    });

    // Try to send email, but don't fail the request if it doesn't work
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: "ritik150595@gmail.com",
        subject:
          normalizedType === "report"
            ? "New Content Report from BuyNBlast"
            : "New Feedback from BuyNBlast",
        html: feedbackHtml,
      });
    } catch (emailErr) {
      console.error("Email send failed:", emailErr.message);
      // Continue without failing the request
    }

    res.status(200).json({ message: "Feedback sent successfully!" });
  } catch (err) {
    console.error("Feedback save error:", err);
    res.status(500).json({ message: "Failed to send feedback" });
  }
};
