const mongoose = require('mongoose');
const { Schema } = mongoose;

const tagSchema = new Schema({
  name: {
    type: String,
    minlength: [3, 'Panjang minimal kategori adalah tiga karakter'],
    required: [true, 'Nama kategori harus diisi'],
  },
});

module.exports = mongoose.model('Tag', tagSchema);
