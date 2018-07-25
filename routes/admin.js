var express = require('express');
var router = express.Router();
var Page = require('../models/page.js');

// -------- Admin Routes '/admin' --------

// Admin Home Page
router.get('/', (req, res) => {
  res.render('admin/admin');
});

// All Pages
router.get('/pages', (req, res) => {
	Page.find({}).sort({sorting: 1}).exec(function(err, pages) {
		res.render('admin/pages', {
			pages: pages
		})
	});
});

// Reorder Pages -- Post
router.post('/pages/reorder-pages', (req, res) => {
  var ids = req.body['id[]'];
  var count = 0;

  for(var i = 0; i < ids.length; i++) {
    var id = ids[i];
    count++;

    (function(count) {
      Page.findById(id, (err, page) => {
        page.sorting = count;
        page.save((err) => {
          if (err) { 
            return console.log(err);
          }
        });
      });
    })(count);
  }
});

// Add Page -- GET
router.get('/add-page', (req, res) => {
 
  var title = "";
  var slug = "";
  var content = "";

  res.render('admin/add_page', {
  	title: title, 
  	slug: slug,
  	content: content,
  });
});

// Add Page -- POST
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

// Edit -- GET
router.get('/pages/edit-page/:slug', (req, res) => {
  
  // Find One Page by Slug 
  Page.findOne({slug: req.params.slug }, (err, page) => {
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

module.exports = router;











