const AdminSchema = require("../model/adminSchema");
const productSchema = require("../model/productSchema");
const ProductSchema = require("../model/productSchema");
const orderSchema = require("../model/orderSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { findByIdAndUpdate } = require("../model/userSchema");
let env = require("dotenv").config();

function generateToken(id) {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  return token;
}

// ADMIN AUTH-----------------------------------------------------------

const adminAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(" ")[1];
      jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
          res.json({ status: false, message: "Unauthorized" });
        } else {
          const admin = await AdminSchema.findById({ _id: decoded.id });
          if (admin) {
            res.json({ status: true, message: "Authorized", adminData: admin });
          } else {
            res.json({ status: false, message: "Admin not exists" });
          }
        }
      });
    } else {
      res.json({ status: false, message: "Token not provided" });
    }
  } catch (err) {
    res.json({ status: false, message: "Token not provided" });
  }
};

// ADMIN LOGIN---------------------------------------------------------------

const doAdminLogin = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    let admin = await AdminSchema.findOne({ email });
    console.log(admin);
    if (admin) {
      let isValid = await bcrypt.compare(password, admin.password);

      if (isValid) {
        const token = generateToken(admin._id);

        res
          .status(200)
          .json({ message: "Login Successfull", admin, token, success: true });
      } else {
        const errors = { password: "Incorrect admin password" };
        res.json({ errors, success: false });
      }
    } else {
      const errors = { email: "Incorrect admin email" };
      res.json({ errors, success: false });
    }
  } catch {
    const errors = { email: "Incorrect admin email or password" };
    console.error("Error fetching products:", errors);
    res.status(500).json({ errors, success: false });
  }
};

// ADD PRODUCT----------------------------------------------------------------------

const addProduct = async (req, res, next) => {
  try {
    const image = req.file.path.replace("public", "");
    let { productName, description, price, category } = req.body;
    let products = await ProductSchema.create({
      productName,
      description,
      price,
      category,
      image,
    });

    res.status(200).json({
      message: "successfully add new products",
      success: true,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong", success: false });
  }
};

// GET ALL PRODUCTS--------------------------------------------------------------------

const getAllProducts = async (req, res, next) => {
  try {
    let products = await ProductSchema.find({ status: "ACTIVE" });
    res.status(200).json({
      message: "successfully get All products",
      success: true,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong", success: false });
  }
};

// DELETE PRODUCT-------------------------------------------------------------------------

const deleteProduct = (req, res, next) => {
  try {
    let productId = req.params.id;
    productSchema
      .findOneAndUpdate(
        { _id: productId },
        { $set: { status: "Blocked" } },
        { new: true }
      )
      .then((response) => {
        res
          .status(200)
          .json({ message: "Deleted Successfully", success: true });
      })
      .catch((error) => {
        res
          .status(500)
          .json({ message: "Error updating product", success: false });
        console.log("Error:", error);
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong", success: false });
  }
};

// UPDATE PRODUCTS------------------------------------------------------------------------

const updateProduct = async (req, res, next) => {
  try {
    let { productName, price, description, category, id } = req.body;
    let editProduct = await ProductSchema.findByIdAndUpdate(
      { _id: id },
      { $set: { productName, price, description, category } },
      { new: true }
    );
    res.status(200).json({
      message: "successfully edit Product",
      success: true,
      editProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong", success: false });
  }
};

// GET ALL ORDERES--------------------------------------------------------------

const getAllOrdres = async (req, res, next) => {
  try {
    let orderData = await orderSchema
      .find()
      .populate("products.item")
      .populate("user");

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

// UPDATE STATUS-------------------------------------------------------------------------------

const updateStatus = async (req, res, next) => {
  try {
    const { statuses } = req.body;
    const updatePromises = Object.entries(statuses).map(([orderId, status]) => {
      console.log(orderId, status);

      return orderSchema.findByIdAndUpdate(
        orderId,
        { $set: { deliverystatus: status } },
        { new: true }
      );
    });
    const updatedOrders = await Promise.all(updatePromises);
    res.status(200).json({
      message: "Update Status successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong", success: false });
  }
};

module.exports = {
  adminAuth,
  doAdminLogin,
  addProduct,
  getAllProducts,
  deleteProduct,
  updateProduct,
  getAllOrdres,
  updateStatus,
};
