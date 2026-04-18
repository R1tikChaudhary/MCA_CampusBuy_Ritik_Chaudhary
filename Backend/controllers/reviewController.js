const mongoose = require("mongoose");
const Review = require("../models/Review");
const Product = require("../models/Product");

exports.createReview = async (req, res) => {
  try {
    const { seller, product, rating, comment } = req.body;

    if (!seller || !product || !rating) {
      return res.status(400).json({ error: "Seller, product and rating are required." });
    }

    if (!mongoose.Types.ObjectId.isValid(seller) || !mongoose.Types.ObjectId.isValid(product)) {
      return res.status(400).json({ error: "Invalid seller or product ID." });
    }

    if (req.user._id.toString() === seller.toString()) {
      return res.status(403).json({ error: "You cannot review your own listing." });
    }

    const foundProduct = await Product.findById(product);
    if (!foundProduct) {
      return res.status(404).json({ error: "Product not found." });
    }

    if (foundProduct.user.toString() !== seller.toString()) {
      return res.status(400).json({ error: "This product does not belong to the provided seller." });
    }

    const existingReview = await Review.findOne({ reviewer: req.user._id, product });
    if (existingReview) {
      return res.status(400).json({ error: "You have already submitted a review for this product." });
    }

    const newReview = await Review.create({
      seller,
      reviewer: req.user._id,
      product,
      rating: Math.max(1, Math.min(5, Number(rating || 0))),
      comment: (comment || "").trim(),
    });

    res.status(201).json(newReview);
  } catch (error) {
    console.error("Error creating review:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "You have already reviewed this product." });
    }
    res.status(500).json({ error: "Failed to create review." });
  }
};

exports.getSellerReviews = async (req, res) => {
  try {
    const { sellerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ error: "Invalid seller ID." });
    }

    const reviews = await Review.find({ seller: sellerId })
      .populate("reviewer", "name profileImage branch")
      .populate("product", "title");

    const reviewCount = reviews.length;
    const averageRating = reviewCount
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      : 0;

    res.json({
      reviewCount,
      averageRating: Number(averageRating.toFixed(1)),
      reviews,
    });
  } catch (error) {
    console.error("Error fetching seller reviews:", error);
    res.status(500).json({ error: "Failed to fetch seller reviews." });
  }
};
