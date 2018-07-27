const express = require('express');
const router = express.Router();

// Get Page Model
const Page = require('../models/page');

// Home Page
router.get('/', (req, res) => {
  
	Page.findOne({slug : 'home'}, (err, page) => {
		if (err) console.log(err);

		res.render('index', { 
			title: page.title,
			content: page.content
		});		
	});
});

// Get a page
router.get('/:slug', (req, res) => {
  
	var slug = req.params.slug;

	Page.findOne({slug : slug}, (err, page) => {
		if (err) console.log(err);

		if (!page) {
			console.log("Youve been Redirected");
			res.redirect('/');
		} else {
			res.render('index', { 
				title: page.title,
				content: page.content
			});
		}
	});
});

module.exports = router;
