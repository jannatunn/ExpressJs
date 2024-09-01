const Product = require('../models/productModel');
const CartItem = require('../models/cartModel');

const update = async (req, res, next) => {
  try {
    const { items } = req.body;

    // Mendapatkan ID produk dari item
    const productIds = items.map(item => item._id);

    // Mengambil produk yang relevan
    const products = await Product.find({ _id: { $in: productIds } });

    // Menyiapkan data cart items
    const cartItems = items.map(item => {
      const relatedProduct = products.find(
        product => product._id.toString() === item._id.toString()
      );
      return {
        product: relatedProduct._id,
        price: relatedProduct.price,
        image_url: relatedProduct.image_url,
        name: relatedProduct.name,
        user: req.user._id,
        qty: item.qty,
      };
    });

    // Menghapus semua item cart untuk pengguna
    await CartItem.deleteMany({ user: req.user._id });

    // Melakukan bulk update atau insert item cart
    await CartItem.bulkWrite(
      cartItems.map(item => ({
        updateOne: {
          filter: { user: req.user._id, product: item.product },
          update: item,
          upsert: true,
        },
      }))
    );

    // Mengembalikan response
    return res.json(cartItems);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.json({
        error: 1,
        message: error.message,
        fields: error.errors,
      });
    }
    next(error);
  }
};

const index = async (req, res, next) => {
  try {
    // Mengambil item cart untuk pengguna
    const items = await CartItem.find({ user: req.user._id }).populate('product');
    return res.json(items);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.json({
        error: 1,
        message: error.message,
        fields: error.errors,
      });
    }
    next(error);
  }
};

module.exports = { index, update };
