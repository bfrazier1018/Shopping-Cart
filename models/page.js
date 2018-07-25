const mongoose = require('mongoose');

// Page Schema
const PageSchema = mongoose.Schema({

	title: {type: String, required: true}, 
	slug: {type: String}, 
	title: {type: String, required: true}, 
	content: {type: String, required: true}, 
	sorting: {type: Number}, 
});

var Page = module.exports = mongoose.model('Page', PageSchema);
