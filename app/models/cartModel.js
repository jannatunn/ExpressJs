const mongoose = require('mongoose');
const { Schema } = mongoose;

const cartItemSchema = new Schema({
  name: {
    type: String,
    minlength: [5, 'Panjang nama makanan minimal 5 karakter'],
    required: [true, 'Nama harus diisi'],
  },
  qty: {
    type: Number,
    required: [true, 'Qty harus diisi'],
    min: [1, 'Minimal qty adalah 1'],
  },
  price: {
    type: Number,
    default: 0,
  },
  image_url: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
  },
}, { timestamps: true });

module.exports = mongoose.model('CartItem', cartItemSchema);
