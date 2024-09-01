const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const AutoIncrement = require('mongoose-sequence')(mongoose);

let userSchema = mongoose.Schema({
  full_name: {
    type: String,
    required: [true, 'Nama harus diisi'],
    maxlength: [255, 'Panjang nama harus antara 3 - 255 karakter'],
    minlength: [3, 'Panjang nama harus antara 3 - 255 karakter'],
  },
  customer_id: {
    type: Number,
    unique: true, // Menambahkan unique constraint untuk customer_id
  },
  email: {
    type: String,
    required: [true, 'Email harus diisi'],
    maxlength: [255, 'Panjang email maksimal 255 karakter'],
    unique: true, // Menambahkan unique constraint untuk email
    validate: {
      validator: function (value) {
        const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return EMAIL_RE.test(value);
      },
      message: 'Email harus merupakan email yang valid'
    }
  },
  password: {
    type: String,
    required: [true, 'Password harus diisi'],
    maxlength: [255, 'Panjang password maksimal 255 karakter']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: "user",
  },
  token: {
    type: [String]
  }
}, { timestamps: true });

// Hash password sebelum menyimpan ke database
const HASH_ROUND = 10;
userSchema.pre("save", function (next) {
  if (this.isModified('password')) {
    this.password = bcrypt.hashSync(this.password, HASH_ROUND);
  }
  next();
});

// Menggunakan AutoIncrement plugin untuk customer_id
userSchema.plugin(AutoIncrement, {inc_field: 'customer_id'});

module.exports = mongoose.model("User", userSchema);
