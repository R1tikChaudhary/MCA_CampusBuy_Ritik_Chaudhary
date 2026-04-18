const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  password: String,
  otp: String,
  otpExpires: Date,
  branch: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  profileImage: { type: String, default: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png' },
  isAdmin: { type: Boolean, default: false },
  savedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  resetPasswordOtp: String,
  resetPasswordExpires: Date,
  refreshToken: String,
  refreshTokenExpires: Date
});

module.exports = mongoose.model("User", userSchema);
