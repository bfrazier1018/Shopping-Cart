const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
var bcrypt = require('bcryptjs');

module.exports = function(passport) {

	passport.use(new LocalStrategy((username, password, done) => {

		User.findOne({username : username}, (err, user) => {
			if (err) 
				console.log(err);

			if (!user) {
				return done(null, false, {message: 'No User Found!'});
			}

			bcrypt.compare(password, user.password, (err, isMatch) => {
				if (err) 
					console.log(err);

				if (isMatch) {
					return done(null, user);
				} else {
					return done(null, false, {message: 'Incorrect Password'});
				}
			});
		});
	}));

	// Stores User in Session
	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	// Retrieves User from Session
	passport.deserializeUser((id, done) => {
		User.findById(id, (err, user) => {
			done(err, user);
		});
	});
};