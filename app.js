var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require("cors")
const { decodeToken } = require("./middlewares")
const productRoute = require("./app/routes/productRoutes")
const categoryRoute = require("./app/routes/categoryRoutes")
const tagRoute = require("./app/routes/tagRoutes")
const authRoute = require("./app/routes/authRoutes")
const deliveryAddressRoute = require("./app/routes/deliveryAddressRoute")
const cartRoute = require("./app/routes/cartRoutes")
const orderRoute = require("./app/routes/orderRoutes")
const invoicesRoute = require("./app/routes/invoiceRoutes")

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'pug');

app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(decodeToken())

// router
app.use("/auth", authRoute)
app.use("/api", productRoute)
app.use("/api", categoryRoute)
app.use("/api", tagRoute)
app.use("/api", deliveryAddressRoute)
app.use("/api", cartRoute)
app.use("/api", orderRoute)
app.use("/api", invoicesRoute)

// home
app.use("/", function(req,res) {
  res.render('index', {
    title : "Eduwork Api Services"
  })
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
