const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      minlength: [3, "panjang nama makanan minimal tiga"],
      required: true,
    },
    description: {
      type: String,
      maxlength: [1000, "panjang deskripsi minimal 1000 karakter"],
    },
    price: {
      type: Number,
      default: 0,
    },
    
    image_url: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
