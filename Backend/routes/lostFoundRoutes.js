const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const LostFoundTicket = require("../models/LostFoundTicket");
const authMiddleware = require("../middleware/authMiddleware");
const cloudinary = require("../config/cloudinary");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", async (req, res) => {
  try {
    const tickets = await LostFoundTicket.find({ moderationStatus: { $ne: "Removed" } })
      .populate("user", "name email branch whatsapp profileImage")
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    console.error("Failed to fetch lost & found tickets:", error);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { itemName, description, category, location, lostDate, lat, lng } = req.body;

    if (!itemName || !description || !category || !location || !lostDate) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Auto-generate tags from item name + description words
    const autoTags = [...new Set([
      category.toLowerCase(),
      ...itemName.toLowerCase().split(/\s+/).filter((w) => w.length > 2),
      ...description.toLowerCase().split(/\s+/).filter((w) => w.length > 3).slice(0, 5),
    ])];

    let uploadedImage = "";
    if (req.file) {
      const base64 = Buffer.from(req.file.buffer).toString("base64");
      const dataUri = `data:${req.file.mimetype};base64,${base64}`;
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: "buyandsell_lost_found",
      });
      uploadedImage = result.secure_url;
    }

    const ticket = await LostFoundTicket.create({
      itemName,
      description,
      category,
      location,
      lostDate,
      coordinates: { lat: lat ? parseFloat(lat) : null, lng: lng ? parseFloat(lng) : null },
      tags: autoTags,
      image: uploadedImage,
      user: req.user._id,
    });

    const populatedTicket = await LostFoundTicket.findById(ticket._id).populate(
      "user",
      "name email branch whatsapp profileImage"
    );

    const io = req.app.get("io");
    if (io && populatedTicket) {
      io.emit("lost_found_ticket_created", populatedTicket);
    }

    res.status(201).json(populatedTicket);
  } catch (error) {
    console.error("Failed to create lost & found ticket:", error);
    res.status(500).json({ error: "Failed to create ticket" });
  }
});

router.patch("/:id/resolve", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ticket id" });
    }

    const ticket = await LostFoundTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    if (ticket.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to update this ticket" });
    }

    ticket.status = "Resolved";
    await ticket.save();

    const updatedTicket = await LostFoundTicket.findById(id).populate(
      "user",
      "name email branch whatsapp profileImage"
    );

    res.json(updatedTicket);
  } catch (error) {
    console.error("Failed to resolve ticket:", error);
    res.status(500).json({ error: "Failed to resolve ticket" });
  }
});

module.exports = router;
