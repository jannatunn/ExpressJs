const router = require('express').Router();
const authController = require('../controllers/authController')
const LocalStrategy = require("passport-local").Strategy;
const passport = require("passport");

// ===> auth <===
passport.use(
  new LocalStrategy({ usernameField: "email" }, authController.localStrategy)
);
router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/logout', authController.logout)
router.get('/me', authController.me)

module.exports = router;