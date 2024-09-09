const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "ACTIVE",
  },
  created: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", ProductSchema);
