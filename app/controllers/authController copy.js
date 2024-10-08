const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const config = require("../config");
const { getToken } = require("../../utils/index");

const register = async (req, res, next) => {
  try {
    const payload = req.body;

    // Validasi password
    if (!payload.password) {
      return res.status(400).json({ error: 1, message: 'Password harus diisi' });
    }

    // Cek apakah email sudah ada
    const existingUser = await User.findOne({ email: payload.email });
    if (existingUser) {
      return res.status(400).json({ error: 1, message: 'Email sudah terdaftar' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(payload.password, 10);

    // Buat user baru
    let user = new User({ ...payload, password: hashedPassword });
    await user.save();

    // Kirim respons sukses
    return res.status(201).json(user);
  } catch (error) {
    // Tangani kesalahan duplikasi email
    if (error.code === 11000) {
      return res.status(400).json({ error: 1, message: 'Email sudah terdaftar' });
    }
    // Tangani kesalahan validasi Mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 1,
        message: error.message,
        fields: error.errors,
      });
    }
    // Tangani kesalahan lainnya
    next(error);
  }
};

const localStrategy = async (email, password, done) => {
  try {
    // Cari pengguna berdasarkan email
    let user = await User.findOne({ email }).select("-__v -createdAt -updatedAt -cart_items -token");
    console.log('User found:', user);
    console.log('Password provided:', password);

    // Jika pengguna tidak ditemukan, kembalikan pesan kesalahan
    if (!user) return done(null, false, { message: 'Email or password incorrect' });

    // Hash password dari user untuk debugging
    console.log('Hashed password from DB:', user.password);

    // Bandingkan password yang diberikan dengan password yang di-hash
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);

    // Jika password cocok, kembalikan pengguna tanpa field password
    if (isMatch) {
      const { password, ...userWithoutPassword } = user.toJSON();
      return done(null, userWithoutPassword);
    } else {
      return done(null, false, { message: 'Email or password incorrect' });
    }
  } catch (err) {
    return done(err);
  }
};


const login = async (req, res, next) => {
  passport.authenticate('local', async function (err, user) {
    if (err) return next(err);
console.log("user di login >", user)
    if (!user) {
      return res.status(401).json({ error: 1, message: 'Email or password incorrect' });
    }

    const token = jwt.sign(user, config.secretkey);
    await User.findByIdAndUpdate(user._id, { $push: { token } });

    res.cookie('auth', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      // secure: true // Uncomment if using HTTPS
    });

    console.log('res.json >', res.json.message)
    return res.json({
      message: 'Login successful',
      user,
      token
    });
  })(req, res, next);
};

const logout = async (req, res, next) => {
  try {
    const token = getToken(req);
    if (!token) {
      return res.status(400).json({ error: 1, message: 'Tidak ada Tooken, Anda Harus Login Terlebih Dahulu' });
    }

    await User.findOneAndUpdate(
      { token: { $in: [token] } },
      { $pull: { token } },
      { useFindAndModify: false }
    );

    res.clearCookie('auth');
    return res.json({ error: 0, message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
};


const me = (req, res, next) => {
  if (!req.user) {
    res.json({
      err: 1,
      message: `You're not login or token expired`,
    });
  }
  res.json(req.user);
};
module.exports = {
  register,
  localStrategy,
  login,
  logout,
  me,
};
