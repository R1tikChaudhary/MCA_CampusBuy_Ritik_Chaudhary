const mongoose = require("mongoose");

const lostFoundTicketSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    lostDate: { type: Date, required: true },
    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    tags: [{ type: String }],
    image: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Open", "Resolved"],
      default: "Open",
    },
    moderationStatus: {
      type: String,
      enum: ["Approved", "Removed"],
      default: "Approved",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LostFoundTicket", lostFoundTicketSchema);
