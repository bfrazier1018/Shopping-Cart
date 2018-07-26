var express = require('express');
var router = express.Router();
// Get Category Model
var Category = require('../models/category.js');

// ************* /admin/categories ************

// ---------------------------------- All Categories ------------------------------
router.get('/', (req, res) => {
	Category.find((err, categories) => {
    if (err) return console.log(err);
    res.render('admin/categories', {
      categories: categories,
    });
  });
});

// -------------------------------- Add Category -- GET --------------------------------
router.get('/add-category', (req, res) => {
 
  var title = "";

  res.render('admin/add_category', {
  	title: title,
  });
});

// ---------------------------------- Add Category -- POST -------------------------------
router.post('/add-category', (req, res) => {
  
  // Express Validator
  req.checkBody('title', 'Title must have a value').notEmpty();

  var title = req.body.title;
  var slug = title.replace(/\s+/g, '-').toLowerCase();
  var content = req.body.content;

  var errors = req.validationErrors();

  if (errors) {
  	res.render('admin/add_category', {
  		errors: errors,
  		title: title,
  		slug: slug,
  	});
  } else {
  	// Check if Title Already Exists
  	Category.findOne({ slug: slug }, (err, category) => {
  		if (category) {
  			req.flash('danger', 'Category Title Exists, Choose Another');
  			res.render('admin/add_category', {
		  		title: title,
	  		});
  		} else {
  			var category = new Category({
  				title: title,
  				slug: slug
  			});
  			// Save Category
  			category.save(function(err) {
  				if (err) return console.log(err);
  				req.flash('success', 'Category Added');
  				res.redirect('/admin/categories');
  			});
  		}
  	}); 	
  }
});

// ------------------------------- Edit Category -- GET ----------------------------
router.get('/edit-category/:id', (req, res) => {
  
  // Find One Category by Slug 
  Category.findById(req.params.id, (err, category) => {
    if (err) return console.log(err);
    
      res.render('admin/edit_category', {
        title: category.title, 
        id: category._id
      });
  });
});

// --------------------------- Edit Category -- POST ----------------------------
router.post('/edit-category/:id', (req, res) => {
  
  // Express Validator
  req.checkBody('title', 'Title must have a value').notEmpty();

  var title = req.body.title;
  var slug = title.replace(/\s+/g, '-').toLowerCase();
  var id = req.params.id;

  var errors = req.validationErrors();

  if (errors) {
    res.render('admin/edit_category', {
      errors: errors,
      title: title,
      id: id
    }); 
  } else {
    // Check if Title Already Exists
    Category.findOne({ slug: slug, _id:{'$ne':id} }, (err, category) => {
      if (category) {
        req.flash('danger', 'Title Exists, Choose Another');
        res.render('admin/edit_category', {
          title: title,
          id: id
        });
      } else {
        // Find Category By Id
        Category.findById(id, (err, category) => {
          if (err) return console.log(err);

          category.title = title;
          category.slug = slug;

           // Save Category
          category.save(function(err) {
            if (err) return console.log(err);
            req.flash('info', 'Category Edited');
            res.redirect('/admin/categories');
          });
        });
      }
    });   
  }
});

// ------------------------- Delete Category --------------------
router.get('/delete-category/:id', (req, res) => {
  Category.findByIdAndRemove(req.params.id, (err) => {
    if (err) return console.log(err);
    req.flash('success', 'Category Deleted');
    res.redirect('/admin/categories');
  });
});

module.exports = router;