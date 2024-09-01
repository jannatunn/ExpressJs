const router = require("express").Router();
const multer = require("multer");
const os = require("os");
const { police_check } = require("../../middlewares")

const productController = require("../controllers/productControllers.js")

router.get("/products", productController.index);
router.post("/products", multer({dest: os.tmpdir()}).single("image"), police_check('create', 'Product'), productController.store);
router.put("/products/:id", multer({dest: os.tmpdir()}).single("image"), police_check('update', 'Product'),  productController.update);
router.delete("/products/:id", police_check('delete', 'Product'),  productController.destroy);

module.exports = router;