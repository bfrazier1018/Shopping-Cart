const express = require('express');
const router = express.Router();
const fs = require('fs-extra');

// Get Product Model
const Product = require('../models/product');
// Get Category Model
const Category = require('../models/category');

// ***************************** /products ******************************

// Get All Products 
router.get('/', (req, res) => {
	Product.find( (err, products) => {
		if (err) console.log(err);

		res.render('all_products', { 
			title: 'All Products',
			products: products
		});		
	});
});

// Get Products by Category
router.get('/:category', (req, res) => {

	var categorySlug = req.params.category;

	Category.findOne({slug: categorySlug}, (err, category) => {
		Product.find({category: categorySlug}, (err, products) => {
			if (err) console.log(err);

			res.render('cat_products', { 
				title: category.title,
				products: products
			});		
		});
	});	
});

// Get Product Details
router.get('/:category/:product', (req, res) => {

	var galleryImages = null;

	Product.findOne({slug: req.params.product}, (err, product) => {
		if (err) {
			console.log(err);
		} else {
			var galleryDir = 'public/product_images/' + product._id + '/gallery';
			fs.readdir(galleryDir, (err, files) => {
				if (err) {
					console.log(err);
				} else {
					galleryImages = files;

					res.render('product', {
						title: product.title,
						product: product,
						galleryImages: galleryImages,
						messages: req.flash('success')
					});
				}
			});
		}
	});
	
});

module.exports = router;
