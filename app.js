const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const validator = require('express-validator');
const flash = require('connect-flash');
const fileUpload = require('express-fileupload');
const passport = require('passport');

// Database 
const mongoose = require('mongoose');
const dbConfig = require('./config/database.js');

// Connect to Database
mongoose.connect(dbConfig.url,  { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
	console.log('-------- Connected to MongoDB ---------');
});

// Set Routes
const pagesRouter = require('./routes/pages');
const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const usersRouter = require('./routes/users');
const adminPagesRouter = require('./routes/admin_pages');
const adminCategoriesRouter = require('./routes/admin_categories');
const adminProductsRouter = require('./routes/admin_products');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(validator({
    customValidators: {
      isImage: (value, filename) => {
        var extension = (path.extname(filename)).toLowerCase();
        switch(extension) {
          case '.jpg': 
            return '.jpg';
          case '.jpeg': 
            return '.jpeg';
          case '.png': 
            return '.png';
          case '': 
            return '.jpg';
          default: 
            return false;
        }
      }
    }
  } 
));
app.use(cookieParser());
// express-Sessions
app.use(session({
  secret: 'supersecret', 
  resave: false, 
  saveUninitialized: false,
  cookie: { maxAge: 60000 }
}));
// express-fileupload
app.use(fileUpload());
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

// Get Page Model
const Page = require('./models/page');
// Get All Pages to Pass to Header.ejs
Page.find({}).sort({sorting: 1}).exec(function(err, pages) {
  if (err) {
    console.log(err);
  } else {
    app.locals.pages = pages;
  }
});

// Get Category Model
const Category = require('./models/category');
// Get All Categories to Pass to Header.ejs
Category.find( (err, categories) => {
  if (err) {
    console.log(err);
  } else {
    app.locals.categories = categories;
  }
});

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Global Variables
app.get('*', (req, res, next) => {
  res.locals.cart = req.session.cart;
  res.locals.user = req.user || null;
  next();
});

// Use Routes
app.use('/products', productsRouter);
app.use('/cart', cartRouter);
app.use('/users', usersRouter);
app.use('/admin/pages', adminPagesRouter);
app.use('/admin/categories', adminCategoriesRouter);
app.use('/admin/products', adminProductsRouter);
app.use('/', pagesRouter);

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
