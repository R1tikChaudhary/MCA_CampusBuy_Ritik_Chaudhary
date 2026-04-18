const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createReview,
  getSellerReviews,
} = require("../controllers/reviewController");

router.post("/", authMiddleware, createReview);
router.get("/seller/:sellerId", getSellerReviews);

module.exports = router;
