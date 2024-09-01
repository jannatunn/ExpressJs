const mongoose = require("mongoose");
const { model, Schema } = mongoose;
const Invoice = require("./invoiceModel.js");
const AutoIncrement = require('mongoose-sequence')(mongoose);

const orderSchema = Schema(
  {
    status: {
      type: String,
      enum: ["waiting_payment", "processing", "in_delivery", "delivered"],
      default: "waiting_payment",
    },

    delivery_fee: {
      type: Number,
      default: 0,
    },

    order_number: {
      type: Number,
    },

    delivery_address: {
      provinsi: { type: String, required: [true, "provinsi harus diisi."] },
      kabupaten: { type: String, required: [true, "kabupaten harus diisi."] },
      kecamatan: { type: String, required: [true, "kecamatan harus diisi."] },
      kelurahan: { type: String, required: [true, "kelurahan harus diisi."] },
      detail: { type: String },
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    order_items: [{ type: Schema.Types.ObjectId, ref: "OrderItem" }],
  },
  { timestamps: true }
);

orderSchema.plugin(AutoIncrement, {inc_field: 'order_number'});
orderSchema.virtual("items_count").get(function () {
  if (!this.order_items || this.order_items.length === 0) return 0;

  return this.order_items.reduce((total, item) => total + (item.qty || 0), 0);
});

// Post save hook to create an invoice
orderSchema.post("save", async function () {
  try {
    // Populate order_items before performing calculations
    await this.populate("order_items").execPopulate();

    let sub_total = this.order_items.reduce(
      (total, item) => (total += (item.price || 0) * (item.qty || 0)),
      0
    );

    let invoice = new Invoice({
      user: this.user,
      order: this._id,
      sub_total: sub_total,
      delivery_fee: parseInt(this.delivery_fee),
      total: parseInt(sub_total + this.delivery_fee),
      delivery_address: this.delivery_address,
    });

    await invoice.save();
  } catch (error) {
    console.error("Error creating invoice:", error);
  }
});

module.exports = model("Order", orderSchema);
