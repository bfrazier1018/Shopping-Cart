const express = require('express');
const router = express.Router();

// Get Product Model
const Product = require('../models/product');

// ***************************** /products ******************************

// All Products
router.get('/', (req, res) => {
	Product.find( (err, products) => {
		if (err) console.log(err);

		res.render('all_products', { 
			title: 'All Products',
			products: products
		});		
	});
});

// Get a page
// router.get('/:slug', (req, res) => {
  
// 	var slug = req.params.slug;

// 	Page.findOne({slug : slug}, (err, page) => {
// 		if (err) console.log(err);

// 		if (!page) {
// 			res.redirect('/');
// 		} else {
// 			res.render('index', { 
// 				title: page.title,
// 				content: page.content
// 			});
// 		}
// 	});
// });

module.exports = router;
