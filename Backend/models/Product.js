const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  condition: String,
  price: Number,
  negotiable: Boolean,
  tags: [String],
  images: [String],
  status: {
    type: String,
    enum: ["Available", "Sold"],
    default: "Available",
  },
  moderationStatus: {
    type: String,
    enum: ["Approved", "Removed"],
    default: "Approved",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  soldAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);
