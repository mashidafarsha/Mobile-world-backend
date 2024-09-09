const router = require("express").Router();
const {adminAuth,doAdminLogin,addProduct,getAllProducts,deleteProduct,updateProduct,getAllOrdres,updateStatus}=require("../controller/adminController")
const {uploadImage}=require("../middlewares/multer")
const {verifyAdminLogin}=require("../middlewares/adminAuth")

router.get("/auth",adminAuth);
router.post('/adminLogin',doAdminLogin)
router.post("/addProduct",verifyAdminLogin,uploadImage.single('Image'), addProduct);
router.get("/getProducts",verifyAdminLogin,getAllProducts)
router.put("/delProducts/:id",verifyAdminLogin,deleteProduct)
router.post("/editProducts",verifyAdminLogin,updateProduct)
router.get("/getAllOrder",verifyAdminLogin,getAllOrdres)
router.put("/updateStatus",verifyAdminLogin,updateStatus)

module.exports = router;


