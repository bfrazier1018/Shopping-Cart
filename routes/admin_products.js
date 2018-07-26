const express = require('express');
const router = express.Router();
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');

// Get Product Model
const Product = require('../models/product.js');
// Get Category Model
const Category = require('../models/category.js');

// ************* /admin/products *****************

// ---------------------------------- All Products ------------------------------
router.get('/', (req, res) => {
	var count;
  
  Product.count((err, c) => {
    count = c;
  });

  Product.find( (err, products) => {
    res.render('admin/products', {
      products: products,
      count: count,
      messages: req.flash('success')
    });
  });
});

// -------------------------------- Add Product -- GET --------------------------------
router.get('/add-product', (req, res) => {
 
  var title = "";
  var desc = "";
  var price = "";

  Category.find( (err, categories) => {
     res.render('admin/add_product', {
      title: title, 
      desc: desc,
      categories: categories,
      price: price
    });
  });
});

// ---------------------------------- Add Product -- POST -------------------------------
router.post('/add-product', (req, res) => {
  
  var imageFile = typeof req.files.image !== 'undefined' ? req.files.image.name : '';

  // Express Validator
  req.checkBody('title', 'Title must have a value').notEmpty();
  req.checkBody('desc', 'Description must have a value').notEmpty();
  req.checkBody('price', 'Price must have a value').isDecimal();
  req.checkBody('image', 'You must upload an image').isImage(imageFile);

  var title = req.body.title;
  var slug = title.replace(/\s+/g, '-').toLowerCase();
  var desc = req.body.desc;
  var price = req.body.price;
  var category = req.body.category;

  var errors = req.validationErrors();

  if (errors) {
    console.log(errors);
  	Category.find( (err, categories) => {
      res.render('admin/add_product', {
        errors: errors,
        title: title, 
        desc: desc,
        categories: categories,
        price: price
    });
  });
  } else {
  	// Check if Slug Already Exists
  	Product.findOne({ slug: slug }, (err, product) => {
  		if (product) {
  			req.flash('danger', 'Product Title Exists, Choose Another');
  			Category.find( (err, categories) => {
          res.render('admin/add_product', {
            title: title, 
            desc: desc,
            categories: categories,
            price: price
        });
      });
  		} else {
        var priceFormated = parseFloat(price).toFixed(2);
  			var product = new Product({
  				title: title,
  				slug: slug,
  				desc: desc,
  				price: priceFormated,
          category: category,
          image: imageFile
  			});
  			// Save Product
  			product.save(function(err) {
  				if (err) 
  	       return console.log(err);

          mkdirp('public/product_images/' + product._id, (err) => {
            return console.log(err);
          });

          mkdirp('public/product_images/' + product._id + '/gallery', (err) => {
            return console.log(err);
          });

          mkdirp('public/product_images/' + product._id + '/gallery/thumbs', (err) => {
            return console.log(err);
          });

          if (imageFile != "") {
            var productImage = req.files.image;
            var path = 'public/product_images/' + product._id + '/' + imageFile; 

            productImage.mv(path, (err) => {
              return console.log(err);
            });
          }

  				req.flash('success', 'Product Added Successfully');
  				res.redirect('/admin/products');
  			});
  		}
  	}); 	
  }
});

// ------------------------------- Edit Product -- GET ----------------------------
router.get('/edit-product/:id', (req, res) => {

  var errors;

  if (req.session.errors) errors = req.session.errors;
  req.session.errors = null;

  Category.find( (err, categories) => {

    // Find Product
    Product.findById(req.params.id, (err, product) => {
      if (err) {
        console.log(err);
        res.redirect('/admin/products');
      } else {
        var galleryDir = 'public/product_images/' + product._id + '/gallery';
        var galleryImages = null;

        fs.readdir(galleryDir, (err, files) => {
          if (err) { 
            console.log(err);
          } else {
            galleryImages = files;

             res.render('admin/edit_product', {
                title: product.title, 
                errors: errors,
                desc: product.desc,
                categories: categories,
                category: product.category.replace(/\s+/g, '-').toLowerCase(),
                price: parseFloat(product.price).toFixed(2),
                image: product.image,
                galleryImages: galleryImages,
                id: product._id,
                messages: req.flash('success')
            });
          }
        });
      }
    });
  });
});

// --------------------------- Edit Product -- POST ----------------------------
router.post('/edit-product/:id', (req, res) => {
  
  var imageFile = typeof req.files.image !== 'undefined' ? req.files.image.name : '';

  // Express Validator
  req.checkBody('title', 'Title must have a value').notEmpty();
  req.checkBody('desc', 'Description must have a value').notEmpty();
  req.checkBody('price', 'Price must have a value').isDecimal();
  req.checkBody('image', 'You must upload an image').isImage(imageFile);

  var title = req.body.title;
  var slug = title.replace(/\s+/g, '-').toLowerCase();
  var desc = req.body.desc;
  var price = req.body.price;
  var category = req.body.category;
  var pimage = req.body.pimage;
  var id = req.params.id

  var errors = req.validationErrors();

  if (errors) {
    req.session.errors = errors;
    res.redirect('/admin/products/edit-product/' + id);
  } else {
    Product.findOne({slug : slug, _id: {'$ne' : id}}, (err, product) => {
      if (err) console.log(err);
      if (product) {
        req.flash('danger', 'Product Title exists, Choose Another');
        res.redirect('/admin/products/edit-product/' + id);
      } else {
        Product.findById(id, (err, product) => {
          if (err) console.log(err);
          product.title = title;
          product.slug = slug;
          product.desc = desc;
          product.price = parseFloat(price).toFixed(2);
          product.category = category;
          if (imageFile != "") {
            product.image = imageFile;
          }

          product.save((err) => {
            if (imageFile != "") {
              if (pimage != "") { 
                fs.remove('public/product_images/' + id + '/' + pimage, (err) => {
                  if (err) console.log(err);
                });
              }

              var productImage = req.files.image;
              var path = 'public/product_images/' + id + '/' + imageFile;

              productImage.mv(path, (err) => {
                return console.log(err);
              });
            }

            req.flash('success', 'Product Updated Successfully');
            res.redirect('/admin/products');
          });
        });
      }
    });
  }
});

// ------------------------- Product Gallery -- POST --------------------
router.post('/product-gallery/:id', (req, res) => {

  var productImage = req.files.file;
  var id = req.params.id;
  var path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
  var thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;

  productImage.mv(path, (err) => {
    if (err) {
      console.log(err);
    } 
    resizeImg(fs.readFileSync(path), {width: 100, height: 100}).then((buf) => {
      fs.writeFileSync(thumbsPath, buf);
    });
  });

  res.sendStatus(200);
});

// ------------------------- Delete Gallery Image --------------------
router.get('/delete-image/:image', (req, res) => {

  var originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
  var thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

  fs.remove(originalImage, (err) => {
    if (err) {
      console.log(err);
    } else {
      fs.remove(thumbImage, (err) => {
        if (err) {
          console.log(err);
        } else {
          req.flash('success', 'Image Deleted Successfully');
          res.redirect('/admin/products/edit-product/' + req.query.id);
        }
      });
    }
  });
});

// ------------------------- Delete Product --------------------
router.get('/delete-product/:id', (req, res) => {

  var id = req.params.id;
  var path = 'public/product_images/' + id;

  fs.remove(path, (err) => {
    if (err) {
      console.log(err);
    } else {
      Product.findByIdAndRemove(id, (err) => {
        console.log(err);
      });

      req.flash('success', 'Product Deleted Successfully');
      res.redirect('/admin/products');
    }
  });
});

module.exports = router;











