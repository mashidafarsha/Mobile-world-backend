const mongoose = require("mongoose");
const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  products: [
    {
      item: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },

      quantity: {
        type: Number,
      },
      price: {
        type: Number,
      },
    },
  ],
  totalprice: {
    type: Number,
  },
});
module.exports = mongoose.model("cart", CartSchema);
