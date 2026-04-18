const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    rating: { type: Number, min: 1, max: 5, default: null },
    like: { type: String, default: "" },
    improve: { type: String, default: "" },
    feedbackType: {
      type: String,
      enum: ["feedback", "report"],
      default: "feedback",
    },
    reportTargetType: {
      type: String,
      enum: ["product", "lost_found", "other", ""],
      default: "",
    },
    reportTargetId: { type: String, default: "" },
    reportStatus: {
      type: String,
      enum: ["open", "resolved", "dismissed"],
      default: "open",
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    moderatedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
