const router = require("express").Router();
const categoryController = require("../controllers/categoryController")

router.get("/categories", categoryController.index)
router.post("/category", categoryController.store)
router.put("/category/:id", categoryController.update)
router.delete("/category/:id", categoryController.destroy)

module.exports = router;