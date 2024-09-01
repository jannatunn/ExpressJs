const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const orderItemSchema = new Schema({
  name: {
    type: String,
    minlength: [5, 'Panjang nama makanan minimal 5 karakter'],
    required: [true, 'Nama harus diisi'],
  },
  price: {
    type: Number,
    required: [true, 'Harga item harus diisi'],
  },
  qty: {
    type: Number,
    required: [true, 'Kuantitas harus diisi'],
    min: [1, 'Kuantitas minimal 1'],
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
  },
  order: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
  }
}, { timestamps: true });

module.exports = model('OrderItem', orderItemSchema);
