const router = require('express').Router()
const invoiceController =  require('../controllers/invoiceControllers')

router.get("/invoices/:order_id", invoiceController.show);

module.exports = router