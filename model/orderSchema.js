const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order_date: {
      type: Date,
      default: Date.now,
    },

    deliverystatus: { type: String, required: true },
    products: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity cannot be less than 1."],
          default: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalprice: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("order", OrderSchema);
