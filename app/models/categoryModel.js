const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
  name: {
    type: String,
    minLength: [3, "Panjang minimal kategory minimal tiga karakter"],
    required: true,
  },
});

module.exports = mongoose.model("Category", categorySchema);