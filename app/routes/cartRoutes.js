const router = require('express').Router();
const cartController = require('../controllers/cartController')
const { police_check } = require("../../middlewares")


router.put('/carts', police_check('update', 'Cart'), cartController.update)
router.get('/carts', police_check('read', 'Cart'), cartController.index)


module.exports = router;