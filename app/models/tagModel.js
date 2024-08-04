const mongoose = require("mongoose");

const tagSchema = mongoose.Schema({
  name: {
    type: String,
    minLength: [3, "Panjang minimal kategory minimal tiga karakter"],
    required: true,
  },
});

module.exports = mongoose.model("Tag", tagSchema);