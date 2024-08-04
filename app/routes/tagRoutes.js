const router = require("express").Router();
const tagController = require("../controllers/tagControllers")

router.get("/tags", tagController.index)
router.post("/tag", tagController.store)
router.put("/tag/:id", tagController.update)
router.delete("/tag/:id", tagController.destroy)

module.exports = router;