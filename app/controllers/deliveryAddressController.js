const { subject } = require("@casl/ability");
const DeliveryAddress = require('../models/deliveryAddressModel');
const { policyFor } = require("../../utils");

const store = async (req, res, next) => {
  try {
    let payload = req.body;
    let user = req.user;
    let address = new DeliveryAddress({ ...payload, user: user._id });

    await address.save();
    return res.json(address);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    let payload = req.body;
    let { id } = req.params;

    // Mencari address berdasarkan ID
    let address = await DeliveryAddress.findById(id);
    if (!address) {
      return res.json({
        error: 1,
        message: "Address not found",
      });
    }

    // Membuat subject untuk otorisasi
    let subjectAddress = subject("DeliveryAddress", {
      ...address.toObject(),
      user_id: address.user,
    });

    // Mengecek otorisasi
    let policy = policyFor(req.user);
    if (!policy.can("update", subjectAddress)) {
      return res.json({
        error: 1,
        message: "You're not allowed to modify this resource",
      });
    }

    // Melakukan update jika diizinkan
    address = await DeliveryAddress.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true, // Menjalankan validasi schema saat update
    });

    // Mengembalikan response dengan data yang diupdate
    res.json(address);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }
    next(err);
  }
};

const destroy = async (req, res, next) => {
  try {
    let { id } = req.params;
    let user = req.user;

    let address = await DeliveryAddress.findOneAndDelete({ _id: id, user: user._id });

    if (!address) {
      return res.json({ error: 1, message: "Address not found or unauthorized" });
    }

    return res.json({ message: "Address deleted successfully" });
  } catch (err) {
    next(err);
  }
};

const index = async (req, res, next) => {
  try {
    let user = req.user;
    let addresses = await DeliveryAddress.find({ user: user._id }).select('-__v');
    return res.json(addresses);
  } catch (err) {
    next(err);
  }
};

module.exports = { store, index, update, destroy };
