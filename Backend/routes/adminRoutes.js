const express = require("express");
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const Product = require("../models/Product");
const LostFoundTicket = require("../models/LostFoundTicket");
const Feedback = require("../models/Feedback");
const Review = require("../models/Review");
const User = require("../models/User");

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/users/search", async (req, res) => {
  try {
    const query = (req.query.q || "").trim();
    const limit = Math.max(parseInt(req.query.limit, 10) || 20, 1);

    if (!query) {
      return res.json({ users: [] });
    }

    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const users = await User.find({
      $or: [{ name: regex }, { branch: regex }],
    })
      .select("name email branch whatsapp isAdmin profileImage")
      .sort({ name: 1 })
      .limit(limit);

    res.json({ users });
  } catch (error) {
    console.error("Failed to search users:", error);
    res.status(500).json({ error: "Failed to search users" });
  }
});

router.get("/moderation/overview", async (req, res) => {
  try {
    const defaultLimit = Math.max(parseInt(req.query.limit, 10) || 20, 1);
    const [products, tickets, reports, productsTotal, ticketsTotal, reportsTotal] = await Promise.all([
      Product.find()
        .populate("user", "name email branch")
        .sort({ createdAt: -1 })
        .limit(defaultLimit),
      LostFoundTicket.find()
        .populate("user", "name email branch")
        .sort({ createdAt: -1 })
        .limit(defaultLimit),
      Feedback.find()
        .sort({ createdAt: -1 })
        .limit(defaultLimit),
      Product.countDocuments(),
      LostFoundTicket.countDocuments(),
      Feedback.countDocuments(),
    ]);

    res.json({
      products,
      tickets,
      reports,
      totals: {
        products: productsTotal,
        tickets: ticketsTotal,
        reports: reportsTotal,
      },
      hasMore: {
        products: products.length < productsTotal,
        tickets: tickets.length < ticketsTotal,
        reports: reports.length < reportsTotal,
      },
    });
  } catch (error) {
    console.error("Failed to fetch moderation overview:", error);
    res.status(500).json({ error: "Failed to fetch moderation data" });
  }
});

router.get("/moderation/products", async (req, res) => {
  try {
    const limit = Math.max(parseInt(req.query.limit, 10) || 20, 1);
    const skip = Math.max(parseInt(req.query.skip, 10) || 0, 0);
    const [items, total] = await Promise.all([
      Product.find()
        .populate("user", "name email branch")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(),
    ]);
    res.json({ items, total, hasMore: skip + items.length < total });
  } catch (error) {
    console.error("Failed to fetch moderation products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/moderation/tickets", async (req, res) => {
  try {
    const limit = Math.max(parseInt(req.query.limit, 10) || 20, 1);
    const skip = Math.max(parseInt(req.query.skip, 10) || 0, 0);
    const [items, total] = await Promise.all([
      LostFoundTicket.find()
        .populate("user", "name email branch")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      LostFoundTicket.countDocuments(),
    ]);
    res.json({ items, total, hasMore: skip + items.length < total });
  } catch (error) {
    console.error("Failed to fetch moderation tickets:", error);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

router.get("/moderation/reports", async (req, res) => {
  try {
    const limit = Math.max(parseInt(req.query.limit, 10) || 20, 1);
    const skip = Math.max(parseInt(req.query.skip, 10) || 0, 0);
    const [items, total] = await Promise.all([
      Feedback.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Feedback.countDocuments(),
    ]);
    res.json({ items, total, hasMore: skip + items.length < total });
  } catch (error) {
    console.error("Failed to fetch moderation reports:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

router.get("/analytics", async (req, res) => {
  try {
    const [totalProducts, approvedProducts, removedProducts, productsByCategory, topSellers, reviewStats] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ moderationStatus: "Approved" }),
      Product.countDocuments({ moderationStatus: "Removed" }),
      Product.aggregate([
        { $match: { moderationStatus: { $ne: "Removed" } } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Product.aggregate([
        { $match: { moderationStatus: { $ne: "Removed" } } },
        { $group: { _id: "$user", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            count: 1,
            name: "$user.name",
            email: "$user.email",
            branch: "$user.branch",
          },
        },
      ]),
      Review.aggregate([
        { $group: { _id: null, averageRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      totalProducts,
      approvedProducts,
      removedProducts,
      productsByCategory,
      topSellers,
      reviewStats: reviewStats[0] || { averageRating: 0, totalReviews: 0 },
    });
  } catch (error) {
    console.error("Failed to fetch admin analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
});

router.patch("/moderation/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid product id" });
    }
    if (!["approve", "remove"].includes(action)) {
      return res.status(400).json({ error: "Invalid moderation action" });
    }

    const moderationStatus = action === "approve" ? "Approved" : "Removed";
    const product = await Product.findByIdAndUpdate(
      id,
      { moderationStatus },
      { new: true }
    ).populate("user", "name email branch");

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const io = req.app.get("io");
    if (io && action === "remove") {
      io.emit("delete_product", product._id);
    }

    res.json(product);
  } catch (error) {
    console.error("Failed to moderate product:", error);
    res.status(500).json({ error: "Failed to moderate product" });
  }
});

router.patch("/moderation/lost-found/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ticket id" });
    }
    if (!["approve", "remove"].includes(action)) {
      return res.status(400).json({ error: "Invalid moderation action" });
    }

    const moderationStatus = action === "approve" ? "Approved" : "Removed";
    const ticket = await LostFoundTicket.findByIdAndUpdate(
      id,
      { moderationStatus },
      { new: true }
    ).populate("user", "name email branch whatsapp profileImage");

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const io = req.app.get("io");
    if (io && action === "remove") {
      io.emit("lost_found_ticket_removed", ticket._id);
    }

    res.json(ticket);
  } catch (error) {
    console.error("Failed to moderate lost/found ticket:", error);
    res.status(500).json({ error: "Failed to moderate ticket" });
  }
});

router.patch("/moderation/reports/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid report id" });
    }
    if (!["open", "resolved", "dismissed"].includes(status)) {
      return res.status(400).json({ error: "Invalid report status" });
    }

    const report = await Feedback.findByIdAndUpdate(
      id,
      {
        reportStatus: status,
        moderatedBy: req.user._id,
        moderatedAt: new Date(),
      },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json(report);
  } catch (error) {
    console.error("Failed to moderate report:", error);
    res.status(500).json({ error: "Failed to moderate report" });
  }
});

module.exports = router;
