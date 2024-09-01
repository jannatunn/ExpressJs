const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name: {
      type: String,
      minlength: [3, 'Panjang nama makanan minimal tiga karakter'],
      required: [true, 'Nama makanan harus diisi'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Panjang deskripsi maksimal 1000 karakter'],
    },
    price: {
      type: Number,
      default: 0,
    },
    image_url: {
      type: String,
      required: [true, 'URL gambar harus diisi'],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    tags: [{
      type: Schema.Types.ObjectId,
      ref: 'Tag',
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
