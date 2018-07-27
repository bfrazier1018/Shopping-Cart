const express = require('express');
const router = express.Router();
const passport = require('passport');
var bcrypt = require('bcryptjs');
// Get User Model
const User = require('../models/user');

// ********************** /users *************************

// GET Register
router.get('/register', (req, res) => {
 	res.render('register', {
 		title: 'Sign Up'
 	});
});

// POST Register 
router.post('/register', (req, res) => {

	var name = req.body.name;
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;

	req.checkBody('name', 'Name is Required!').notEmpty();
	req.checkBody('email', 'Email is Required!').notEmpty();
	req.checkBody('username', 'Username is Required!').notEmpty();
	req.checkBody('password', 'Password is Required!').notEmpty();
	req.checkBody('password2', 'Passwords do Not Match!').equals(password);

	var errors = req.validationErrors();
	if (errors) {
		res.render('register', {
			errors: errors,
			user: null,
			title: 'Register'
		});
	} else {
		User.findOne({username: username}, (err, user) => {
			if (err) console.log(err);

			if (user) {
				req.flash('danger', 'Username exists, choose another');
				res.redirect('/users/register');
			} else {
				var user = new User({
					name: name,
					email: email,
					username: username,
					password: password,
					admin: 0
				});

				// Bcrypt Password
				bcrypt.genSalt(10, function(err, salt) {
					bcrypt.hash(user.password, salt, function (err, hash) {
						if (err) 
							console.log(err);

						user.password = hash;

						user.save((err) => {
							if (err) {
								console.log(err);
							} else {
								req.flash('success', 'You are Now Registered');
								res.redirect('/users/login');
							}
						});
					});
				});
			}
		});
	}
});

// GET Log In
router.get('/login', (req, res) => {
 	
 	// If User is Logged In
 	if (req.user) res.redirect('/');
 	
 	res.render('login', {
 		title: 'Log In',
 		messages: req.flash('success')
 	});
});

// POST Log In
router.post('/login', (req, res, next) => {
	
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/users/login',
		failureFlash: true
	})(req, res, next);
});


// GET Logout 
router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success', 'You have Logged Out');
	res.redirect('/users/login');
});

module.exports = router;
