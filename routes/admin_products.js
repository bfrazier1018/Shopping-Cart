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

  Product.countDocuments((err, c) => {
    count = c;
  });

  Product.find( (err, products) => {
    res.render('admin/products', {
      products: products,
      count: count
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

// ---------------------------------- Add Page -- POST -------------------------------
router.post('/add-page', (req, res) => {
  
  // Express Validator
  req.checkBody('title', 'Title must have a value').notEmpty();
  req.checkBody('content', 'Content must have a value').notEmpty();

  var title = req.body.title;
  var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
	  if (slug === "") {
	  	slug = title.replace(/\s+/g, '-').toLowerCase();
	  }
  var content = req.body.content;

  var errors = req.validationErrors();

  if (errors) {
  	res.render('admin/add_page', {
  		errors: errors,
  		title: title,
  		slug: slug,
  		content: content,
  	});
  } else {
  	// Check if Slug Already Exists
  	Page.findOne({ slug: slug }, (err, page) => {
  		if (page) {
  			req.flash('danger', 'Page Slug Exists, Choose Another');
  			res.render('admin/add_page', {
		  		title: title,
		  		slug: slug,
		  		content: content,
	  		});
  		} else {
  			var page = new Page({
  				title: title,
  				slug: slug,
  				content: content,
  				sorting: 100
  			});
  			// Save Page
  			page.save(function(err) {
  				if (err) {
  					return console.log(err);
  				}
  				req.flash('success', 'Page Added');
  				res.redirect('/admin/pages');
  			});
  		}
  	}); 	
  }
});

// ------------------------------- Edit Page -- GET ----------------------------
router.get('/edit-page/:id', (req, res) => {
  
  // Find One Page by Slug 
  Page.findById(req.params.id, (err, page) => {
    if (err) {
      return console.log(err);
    } else {
      console.log(page.content);
      res.render('admin/edit_page', {
        title: page.title, 
        slug: page.slug,
        content: page.content,
        id: page._id
      });
    }
  });
});

// --------------------------- Edit Page -- POST ----------------------------
router.post('/edit-page/:id', (req, res) => {
  
  // Express Validator
  req.checkBody('title', 'Title must have a value').notEmpty();
  req.checkBody('content', 'Content must have a value').notEmpty();

  var title = req.body.title;
  var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug === "") {
      slug = title.replace(/\s+/g, '-').toLowerCase();
    }
  var content = req.body.content;
  var id = req.params.id;

  var errors = req.validationErrors();

  if (errors) {
    res.render('admin/edit_page', {
      errors: errors,
      title: title,
      slug: slug,
      content: content,
      id: id
    }); 
  } else {
    // Check if Slug Already Exists
    Page.findOne({ slug: slug, _id:{'$ne':id} }, (err, page) => {
      if (page) {
        req.flash('danger', 'Page Slug Exists, Choose Another');
        res.render('admin/edit_page', {
          title: title,
          slug: slug,
          content: content,
          id: id
        });
      } else {
        // Find Page By Id
        Page.findById(id, (err, page) => {
          if (err) return console.log(err);
          page.title = title;
          page.slug = slug;
          page.content = content;

           // Save Page
          page.save(function(err) {
            if (err) return console.log(err);
            req.flash('success', 'Page Added');
            res.redirect('/admin/pages');
          });
        });
      }
    });   
  }
});

// ------------------------- Delete Page --------------------
router.get('/delete-page/:id', (req, res) => {
  Page.findByIdAndRemove(req.params.id, (err) => {
    if (err) return console.log(err);
    req.flash('success', 'Paged Deleted');
    res.redirect('/admin/pages');
  });
});

module.exports = router;











