const CartItem = require("../models/cartModel");
const DeliveryAddress = require("../models/deliveryAddressModel");
const Order = require("../models/orderModel");
const { Types } = require("mongoose");
const OrderItem = require("../models/orderItemModel");

const store = async (req, res, next) => {
  try {
    let { delivery_fee, delivery_address } = req.body;

    // Validate inputs
    if (!delivery_fee || !delivery_address) {
      return res.status(400).json({
        error: 1,
        message: "Delivery fee and delivery address are required.",
      });
    }

    let items = await CartItem.find({ user: req.user._id }).populate("product");
    if (!items.length) {
      return res.status(400).json({
        error: 1,
        message: "You cannot create an order because there are no items in your cart.",
      });
    }

    let address = await DeliveryAddress.findById(delivery_address);
    if (!address) {
      return res.status(404).json({
        error: 1,
        message: "Delivery address not found.",
      });
    }

    let order = new Order({
      _id: new Types.ObjectId(),
      status: "waiting_payment",
      delivery_fee: delivery_fee,
      delivery_address: {
        provinsi: address.provinsi,
        kabupaten: address.kabupaten,
        kecamatan: address.kecamatan,
        kelurahan: address.kelurahan,
        detail: address.detail,
      },
      user: req.user._id,
    });

    let orderItems = await OrderItem.insertMany(
      items.map((item) => ({
        name: item.product.name,
        image: item.product.image_url,
        qty: parseInt(item.qty),
        price: parseInt(item.product.price),
        order: order._id,
        product: item.product._id,
      }))
    );

    orderItems.forEach((item) => order.order_items.push(item));

    // Save order and handle errors
    await order.save();
    await CartItem.deleteMany({ user: req.user._id });

    return res.status(201).json(order);
  } catch (err) {
    console.error("Error creating order:", err); // Log error for debugging
    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }
    next(err);
  }
};

const index = async (req, res, next) => {
  try {
    let { skip = 0, limit = 10 } = req.query;
    let count = await Order.find({ user: req.user._id }).countDocuments();
    let orders = await Order.find({ user: req.user._id })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate("order_items")
      .sort("-createdAt");

    return res.status(200).json({
      data: orders.map((order) => order.toJSON({ virtuals: true })),
      count,
    });
  } catch (err) {
    console.error("Error fetching orders:", err); // Log error for debugging
    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }
    next(err);
  }
};

module.exports = {
  store,
  index,
};
