var express = require('express');
var router = express.Router();
// Get Page Model
var Page = require('../models/page.js');

// ************* /admin/pages *****************

// ---------------------------------- All Pages ------------------------------
router.get('/', (req, res) => {
	Page.find({}).sort({sorting: 1}).exec(function(err, pages) {
		res.render('admin/pages', {
			pages: pages
		})
	});
});

// -------------------------------- Reorder Pages -- AJAX Post ---------------------------
router.post('/reorder-pages', (req, res) => {
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

// -------------------------------- Add Page -- GET --------------------------------
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











