const express = require("express");
const router = express.Router();
const multer = require("multer");
const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/user", authMiddleware, async (req, res) => {
  try {
    const products = await Product.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(products);
  } catch (err) {
    console.error("Error fetching user products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/purchases/me", authMiddleware, async (req, res) => {
  try {
    const purchases = await Product.find({
      buyer: req.user._id,
      status: "Sold",
    })
      .populate("user", "name email profileImage branch whatsapp")
      .sort({ soldAt: -1, createdAt: -1 });

    res.json(purchases);
  } catch (error) {
    console.error("Error fetching purchase history:", error);
    res.status(500).json({ error: "Failed to fetch purchase history" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const products = await Product.find({ moderationStatus: { $ne: "Removed" } })
      .populate("user", "name email profileImage branch whatsapp")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/recommendations/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const match = {
      _id: { $ne: product._id },
      moderationStatus: { $ne: "Removed" },
    };

    if (product.tags && product.tags.length > 0) {
      match.$or = [
        { tags: { $in: product.tags } },
        { category: product.category },
      ];
    } else {
      match.category = product.category;
    }

    const recommended = await Product.find(match)
      .populate("user", "name email profileImage branch whatsapp")
      .sort({ createdAt: -1 })
      .limit(8);

    res.json({ recommendations: recommended });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      moderationStatus: { $ne: "Removed" },
    }).populate("user", "name email profileImage branch whatsapp");

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// @route POST /api/product/upload
// @desc  Upload and create new product
router.post(
  "/upload",
  authMiddleware,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const { title, description, category, condition, price, negotiable } =
        req.body;
      let { tags } = req.body;

      if (!title || !description || !category || !condition || !price) {
        return res.status(400).json({ error: "All fields are required" });
      }

      if (tags && typeof tags === "string") {
        tags = tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
      }

      if (!req.files || req.files.length === 0) {
        return res
          .status(400)
          .json({ error: "At least one image is required" });
      }

      if (!req.user) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const uploadedImages = [];
      for (const file of req.files) {
        const base64 = Buffer.from(file.buffer).toString("base64");
        const dataUri = `data:${file.mimetype};base64,${base64}`;

        const result = await cloudinary.uploader.upload(dataUri, {
          folder: "buyandsell_products",
        });
        uploadedImages.push(result.secure_url);
      }

      const newProduct = new Product({
        title,
        description,
        category,
        condition,
        price,
        negotiable: negotiable === "true" || negotiable === "on",
        tags: Array.isArray(tags) ? tags : [],
        images: uploadedImages,
        user: req.user._id,
        moderationStatus: "Approved",
      });

      await newProduct.save();

      res.status(201).json({
        message: "Product uploaded successfully",
        product: newProduct,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Product upload failed." });
    }
  }
);

// @route DELETE /api/product/:id
// @desc  Delete a user's own product
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid product ID format" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to delete this product" });
    }

    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Failed to delete product:", err.message);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

module.exports = router;
