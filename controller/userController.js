const userSchema = require("../model/userSchema");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
let env = require("dotenv").config();
const ProductSchema = require("../model/productSchema");
const orderSchema = require("../model/orderSchema");
const { signupSchema, loginSchema } = require("../model/validationSchema");
const mongoose = require("mongoose");
const CartSchema = require("../model/cart");

function generateToken(id) {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  return token;
}

// USER AUTH-------------------------------------------------

const userAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log(authHeader, "llll");
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
          res.json({ status: false, message: "Unauthorized" });
        } else {
          const user = await userSchema.findById({ _id: decoded.id });

          if (user) {
            res.json({ status: true, message: "Authorized", userData: user });
          } else {
            res.json({ status: false, message: "Admin not exists" });
          }
        }
      });
    } else {
      res.json({ status: false, message: "Token not provided" });
    }
  } catch {
    res.status(401).json({ message: "Not authorized" });
  }
};

// --------------------------------------------------------------------
// SIGNUP--------------------------------------------------------------

const doUserSignup = async (req, res) => {
  const { error } = signupSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details.map((detail) => detail.message).join(", "),
    });
  }
  try {
    let { name, email, password } = req.body;
    const saltRounds = 10;
    const newPassword = await bcrypt.hash(password, saltRounds);

    let userData = await userSchema.create({
      name,
      email,
      password: newPassword,
    });

    res.status(200).json({
      success: true,
      userData,
      message: "Successfully created new user",
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Error", err });
  }
};

// LOGIN-------------------------------------------------

const doUserLogin = async (req, res, next) => {
  const { error } = loginSchema.validate(req.body);

  if (error)
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });

  try {
    let { email, password } = req.body;

    let user = await userSchema.findOne({ email });
    console.log("User found:", user);

    if (user) {
      let isValid = await bcrypt.compare(password, user.password);

      if (isValid) {
        const token = generateToken(user._id);

        res
          .status(200)
          .json({ message: "Login Successfull", user, token, success: true });
      } else {
        const errors = { password: "Incorrect user password" };
        res.json({ errors, success: false });
      }
    } else {
      const errors = { email: "Incorrect user email" };
      res.json({ errors, success: false });
    }
  } catch {
    const errors = { email: "Incorrect user email or password" };
    console.error("Error fetching products:", errors);
    res.status(500).json({ errors, success: false });
  }
};

// GET ALL PRODUCTS-------------------------------------------------

const getAllProducts = async (req, res, next) => {
  try {
    let products = await ProductSchema.find({ status: "ACTIVE" });
    console.log(products);
    res
      .status(200)
      .json({ message: "products get Successfully", products, success: true });
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({
        message: "Something went wrong, please try again later",
        success: false,
      });
  }
};

// GET PRODUCT BY ID--------------------------------------------------

const getProductById = async (req, res, next) => {
  try {
    let productId = req.params.Id;
    let product = await ProductSchema.findById({ _id: productId });
    console.log(product);
    res
      .status(200)
      .json({ message: "products get Successfully", product, success: true });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "something wrong", success: false });
  }
};

// ADD TO CART------------------------------------------------------------

const addToCart = async (req, res, next) => {
  try {
    const { userId, productId } = req.body;
    let product = await ProductSchema.findOne({ _id: productId });
    console.log(product, "product");
    let proObj = {
      item: productId,
      quantity: 1,
      price: product.price,
    };
    let userCartData = await CartSchema.findOne({ user: userId });
    if (userCartData) {
      let proExist = userCartData.products.findIndex(
        (p) => p.item == productId
      );

      if (proExist != -1) {
        const quantity = userCartData.products[proExist].quantity;

        await CartSchema.updateOne(
          {
            user: userId,
            "products.item": productId,
          },
          {
            $inc: {
              "products.$.quantity": 1,
              "products.$.price": product.price,
              totalprice: product.price,
            },
          }
        );
      } else {
        await CartSchema.updateOne(
          { user: userId },
          { $push: { products: proObj }, $inc: { totalprice: product.price } }
        );
      }
    } else {
      let userCart = {
        user: userId,
        products: [proObj],
        totalprice: product.price,
      };
      let newCart = await CartSchema.create(userCart);
      console.log(newCart, "masasd");
    }
    res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
    });
  } catch (error) {
    console.error("Error adding product to cart", error);
    res.status(500).json({
      success: false,
      message: "Failed to add product to cart",
    });
  }
};

// GET CART -------------------------------------------------------------

const getCartProduct = async (req, res, next) => {
  try {
    let userId = req.userId;

    let userCartData = await CartSchema.findOne({ user: userId });
    const productsCount =
      userCartData && userCartData.products ? userCartData.products.length : 0;

    res.status(200).json({
      message: "products get Successfully",
      product: userCartData,
      count: productsCount,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "something wrong", success: false });
  }
};

const getProductDetails = async (req, res, next) => {
  try {
    let productId = req.params.Id;
    let product = await ProductSchema.findById({ _id: productId });

    res
      .status(200)
      .json({ message: "products get Successfully", product, success: true });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "something wrong", success: false });
  }
};

// UPDATE QUANTITY------------------------------------------------------

const updateQuantity = async (req, res) => {
  try {
    let userId = req.userId;
    const itemId = req.params.Id;
    const { value } = req.body;

    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(itemId)
    ) {
      return res.status(400).json({ message: "Invalid userId or itemId" });
    }

    if (isNaN(value) || value <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const itemObjectId = new mongoose.Types.ObjectId(itemId);

    const cart = await CartSchema.findOne({
      user: userObjectId,
      "products._id": itemObjectId,
    }).populate("products.item");

    if (!cart) {
      return res.status(404).json({ message: "Cart or item not found" });
    }

    const product = cart.products.find((p) => p._id.equals(itemObjectId));

    if (!product) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    const productPricePerUnit = product.item.price;

    if (isNaN(productPricePerUnit)) {
      return res.status(500).json({ message: "Product price is not valid" });
    }

    product.quantity = value;

    product.price = productPricePerUnit * value;

    if (isNaN(product.price)) {
      return res.status(500).json({ message: "Calculated price is not valid" });
    }

    cart.totalprice = cart.products.reduce(
      (total, prod) => total + prod.price,
      0
    );

    await cart.save();

    res
      .status(200)
      .json({ message: "Quantity updated successfully", product, cart });
  } catch (error) {
    console.error("Error updating quantity", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//  SUBMIT CART ------------------------------------------------------

const submitCartData = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { products, totalAmount } = req.body;
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res
        .status(400)
        .json({ message: "No products provided", success: false });
    }

    if (!totalAmount || typeof totalAmount !== "number") {
      return res
        .status(400)
        .json({ message: "Invalid total amount", success: false });
    }

    const orderData = await orderSchema.create({
      user: userId,
      products: products.map((product) => ({
        item: product.item,
        quantity: product.quantity,
        price: product.price,
      })),
      deliverystatus: "Ordered",
      totalprice: totalAmount,
    });
    let deletecart = await CartSchema.deleteOne({ user: userId });

    res.status(200).json({
      message: "Successfully added new products",
      success: true,
      order: orderData,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

// GET ORDER DETAILS------------------------------------------------------------

const getMyOrders = async (req, res, next) => {
  try {
    let userId = req.userId;

    let orderData = await orderSchema
      .find({ user: userId })
      .populate("products.item");

    if (!orderData) {
      return res.status(404).json({
        message: "No orders found for this user.",
        success: false,
      });
    }

    console.log(JSON.stringify(orderData, null, 2), "Order Data");

    res.status(200).json({
      message: "Products retrieved successfully",
      order: orderData,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong", success: false });
  }
};

module.exports = {
  userAuth,
  doUserSignup,
  doUserLogin,
  getAllProducts,
  getProductById,
  addToCart,
  getCartProduct,
  getProductDetails,
  updateQuantity,
  submitCartData,
  getMyOrders,
};
