const router = require('express').Router()
const {police_check} = require('../../middlewares')
const deliveryAddressController = require('../controllers/deliveryAddressController')

router.post('/deliveri-addresses', police_check('create', 'DeliveryAddress'), deliveryAddressController.store)

module.exports = router