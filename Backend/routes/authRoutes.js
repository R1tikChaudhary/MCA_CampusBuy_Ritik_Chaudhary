const express = require("express");
const router = express.Router();
const { sendOtp, verifyOtp, login, refreshToken, updateProfile, getUserProfile, getSellerProfile, getFavorites, toggleFavoriteProduct, forgotPassword, resetPassword, resendOtp } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp); // Add this line
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put("/update-profile", authMiddleware, updateProfile);
router.get("/profile", authMiddleware, getUserProfile);
router.get("/seller/:id", getSellerProfile);
router.get("/favorites", authMiddleware, getFavorites);
router.post("/favorites/:productId", authMiddleware, toggleFavoriteProduct);

// Upload profile image
router.post("/upload-image", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const base64 = Buffer.from(req.file.buffer).toString("base64");
    const dataUri = `data:${req.file.mimetype};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "buyandsell_profiles",
    });

    res.json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: "Image upload failed" });
  }
});

module.exports = router;
