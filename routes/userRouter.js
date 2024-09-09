const router = require("express").Router();
const {
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

} = require("../controller/userController");
const { verifyUserLogin } = require("../middlewares/userAuth");

router.get("/auth", userAuth);
router.post("/signup", doUserSignup);
router.post("/login", doUserLogin);
router.get("/getProduct", getAllProducts);
router.get("/getProductById/:Id", getProductById);
router.post("/addTocart", addToCart);
router.get("/getCartPro", verifyUserLogin, getCartProduct);
router.get("/getProDetails/:Id", getProductDetails);
router.post("/updateQuantity/:Id", verifyUserLogin, updateQuantity);
router.post("/checkout",verifyUserLogin, submitCartData);
router.get("/getMyOrder", verifyUserLogin, getMyOrders);
// router.get("/getCartCount", verifyUserLogin, getCartCount);
module.exports = router;
