const router = require("express").Router();
const { police_check } = require("../../middlewares/index.js")
const orderControllers = require("../controllers/orderControllers.js")

router.post("/orders", police_check('create', 'Order'), orderControllers.store);
router.get("/products",police_check('view', 'Order'), orderControllers.index);

module.exports = router;