const router = require("express").Router();
const categoryController = require("../controllers/categoryControllers")
const { police_check } = require("../../middlewares")

router.get("/categories", categoryController.index)
router.post("/category", police_check('create', 'Category'),  categoryController.store)
router.put("/category/:id", police_check('update', 'Category'), categoryController.update)
router.delete("/category/:id", police_check('delete', 'Category'), categoryController.destroy)

module.exports = router;