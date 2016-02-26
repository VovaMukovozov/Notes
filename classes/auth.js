'use strict';

// Libs
var bcrypt = require('bcrypt'),
	utils = app.get('utils'),
	jwt = require('jwt-simple'),
	passport = require('passport');

var TwitterStrategy = require('passport-twitter').Strategy,
	FacebookStrategy = require('passport-facebook').Strategy,
	GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
	LinkedInStrategy = require('passport-linkedin-oauth2').OAuth2Strategy;

var auth = {
	allowd: function(permissions) {
		return function(req, res, next) {

			// Request validation
			var token = req.headers.token || '',
				regex = /^[a-zA-Z0-9_.+-=]{150,250}$/;

			if (!token || !regex.exec(token)) { return utils.res.error(res, { message: 'Access Denied', status: 401, reason: 'Missing token' }); }

			// Token validation
			var payload = _auth.token.decode(token);
			if (!payload || !payload.id) { return utils.res.error(res, { message: 'Access Denied', status: 401, reason: 'Failed to decoded token', debug: token }); }

			// Validate the user is active
			_auth.query()
			.count('id as count')
			.where({ id: payload.id })
			.asCallback( function (err, result) {
				if (err || !result[0].count) { return utils.res.error(res, { message: 'Access Denied', status: 401, reason: 'User is disabled' }); }

				// Store the user id
				req.id = payload.id;

				// Permissions validation
				permissions = permissions || 'active';
				return auth.token.check(payload, permissions) ? next() : utils.res.error(res, { message: 'Forbidden', status: 403, reason: 'Don\'t have sufficient permissions', debug: { required: permissions } });
			});
		};
	},
	login: function(email, password, callback) {
		if (!email || !password) { return callback('Login attempt without credentials', false); }

		_auth.query()
		.select('id', 'password', 'is_active')
		.where({ email: email })
		.then( function(result) {
			if (!result.length) { return callback('Login attempt with incorrect email', false); }

			var user = result[0];

			bcrypt.compare(password, user.password, function(err, result) {
				if (err || !result) { return callback('Incorrect password', false); }

				_auth.update_last_login(user.id);

				if (user.is_email_confirmed) {
					_auth.password.clear_token(user.id);
				}

				var keys = {
						active: (user.is_active === 1),
						admin: (user.is_key_admin === 1)
					},
					result = {
						is_authenticated: result
					};

					result = _.extend(result, {
						token: auth.token.generate({
							id: user.id,
							keys: keys
						}),
						keys: keys,
						is_closed: (user.is_active === 0),
						is_email_confirmed: (user.is_email_confirmed === 1)
					});

				// Response
				return callback(null, result);
			})
		})
		.catch(callback);
	},
	token: {
		generate: function(user) {

			// A = active
			// D = admin
			var keys = '';

			if (user.keys.active) { keys += 'A'; }
			if (user.keys.admin) { keys += 'D'; }

			return _auth.token.encode({
				id: user.id,
				keys: keys
			});
		},
		check: function(token, permissions) {

			var payload = false,
				proceed = false;
			if (_.isString(token)) {
				payload = _auth.token.decode(token);
				if (!payload || !payload.id || !_.isString(payload.keys)) { return false; }
			} else if (_.isPlainObject(token) && token.id && _.isString(token.keys)) {
				payload = token;
			} else {
				return false;
			}

			// Role checking
			function check_role(role) {

				switch(role){
					case 'inactive':
						proceed = (proceed || payload.keys.indexOf('A') == -1);
						break;
					case 'active':
						proceed = (proceed || payload.keys.indexOf('A') > -1);
						break;
					case 'admin':
						proceed = (proceed || payload.keys.indexOf('D') > -1);
						break;
				}
			}

			// Auto proceed for admin
			if (payload.keys.indexOf('D') > -1) {
				return true;
			}

			if (_.isString(permissions)) {
				check_role(permissions);
			} else if (_.isArray(permissions)) {
				_.forEach(permissions, check_role);
			} else if (!permissions) {
				proceed = true;
			}

			return proceed;
		},
		encode: function(payload) {
			return _auth.token.encode(payload);
		},
		decode: function(token) {
			return _auth.token.decode(token);
		}
	},
	get: {
		id: function(req) {

			// Get the user ID from the token
			var token = req.headers.token || '';

			if (_.isString(token) && token) {
				// Token validation
				var payload = _auth.token.decode(token);
				if (!payload || !_.isNumber(payload.id)) { return 0; }
				return payload.id;
			} else if (_.isPlainObject(token) && _.isNumber(token.id)) {
				return token.id;
			}

			return 0;
		},
		stripeCustomerID: function(req, callback) {

			_auth.query()
			.select('stripe_id')
			.where({ is_suspended: false, id: auth.get.id(req) })
			.then( function(result) {
				if (!result.length) { return callback('Invalid user ID or the user is disabled', false); }

				return callback(null, result[0].stripe_id);
			})
			.catch(callback);
		}
	},
	password: {
		change: function(id, current_password, new_password, callback) {
			if (!id || !current_password || !new_password) { return callback('Missing parameters', false); }

			_auth.query()
			.select('password')
			.where({ is_active: true, is_suspended: false, id: id })
			.then( function(result) {
				if (!result.length) { return callback('Invalid user ID', false); }

				var user = result[0];

				bcrypt.compare(current_password, user.password, function(err, result) {
					if (err || !result) { return callback('Incorrect password', false); }

					_auth.password.clear_token(user.id);
					_auth.password.set(id, user.password, new_password, function(err, result) {
						var status = !(err);
						return callback(err, status);
					});
				});
			})
			.catch(callback);
		},
		generate: function() {
			var generatePassword = require('password-generator');
			var password = generatePassword(8, false);
			return auth.password.encrypt(password);
		},
		encrypt: function(password) {
			return bcrypt.hashSync(password, bcrypt.genSaltSync(10))
		}
	},
	social: {
		validate: function(token, profile, providerKey, callback) {

			var data = {}

			data[providerKey] = profile.id;

			_auth.query()
			.select('id', 'is_active', 'is_key_admin')
			.where(data)
			.then( function(result) {
				if (!result.length) { return auth.social.register(token, profile, providerKey, callback); }

				var user = result[0];

				// Make sure the user is not suspended
				if (!user.is_active) { return callback(true, null); }

				_auth.update_last_login(user.id);
				_auth.password.clear_token(user.id);

				var is_admin = (user.is_key_admin === 1),
					user_data = {
						id: user.id,
						keys: {
							admin: is_admin
						}
					}

				// Login
				callback(null, auth.token.generate(user_data));

			})
			.catch(callback);
		},
		register: function(token, profile, providerKey, callback) {

			utils.log(token);
			utils.log(profile);

			// Make sure we've got email address
			if (providerKey == 'facebook_id' && (!profile.emails || !profile.emails[0].value)) {
				return callback(JSON.stringify({ sucsess: false, message: 'Missing email address'}), null);
			}

			// else if(providerKey == 'twitter_id' &&  typeof profile.user.local.email === "undefined" || profile.user.local.email){
			// 	return callback(JSON.stringify({ sucsess: false, message: 'Missing email address'}), null);
			// }

			var data = {
				first_name: '',
				last_name: '',
				email: '',
				is_email_confirmed: profile._json.verified || false,
				is_active: true,
				plan: 't',
				company: '',
				industry: '',
				password: '',
				last_login: new Date(),
				created_at: new Date()
			};

			if (providerKey == 'facebook_id') {
				data.first_name = profile.name.givenName;
				data.last_name = profile.name.familyName;
				data.email = profile.emails[0].value;
			} else if (providerKey == 'twitter_id') {
				data.first_name = profile.displayName.split(' ')[0];
				data.last_name = profile.displayName.split(' ')[1];
				data.email = profile.user.local.email;
			} else {
				data.first_name = profile.first_name;
				data.last_name = profile.last_name;
			}

			data[providerKey] = profile.id;

			// Creating a stripe customer
			var stripe = require('stripe')(CONFIG.STRIPE.KEY);
			stripe.customers.create({
				description: data.first_name + ' ' + data.last_name,
				email: data.email
			}, function(err, customer) {
				if (err) { return callback(JSON.stringify({ sucsess: false, message: 'Could not register user'}), null); }

				data.stripe_id = customer.id;

				// Register user
				_auth.query()
				.insert(data)
				.then( function(result) {
					if (!result.length) { return callback(true, null); }

					var user = result[0];

					var user_data = {
							id: user.id,
							keys: {
								admin: false
							}
						}

					return callback(null, auth.token.generate(user_data));

				})
				.catch(callback);

			});
		},
		enter: function(req, res) {
			utils.res.ok(res, {
				sucsess: true,
				token: req.user
			});
		}
	}
}

var _auth = {
	query: function() {
		return Knex('users');
	},
	update_last_login: function(id, callback) {
		_auth.query()
		.update({ last_login: new Date() })
		.where('id', id)
		.asCallback(callback);
	},
	password: {
		set: function(uid, current_password, new_password, callback) {
			_auth.query()
			.update({
				password: auth.password.encrypt(new_password),
				history: current_password
			})
			.where('id', uid)
			.asCallback(callback);
		},
		clear_token: function(id, callback) {
			_auth.query()
			.update({ action_token: ''})
			.where('id', id)
			.asCallback(callback);
		}
	},
	token: {
		encode: function(payload) {
			if (!payload.hasOwnProperty('secret')) {
				payload.secret = CONFIG.AUTH.TOKEN.SECRET;
			}

			return jwt.encode(payload, CONFIG.AUTH.TOKEN.KEY);
		},
		decode: function(token) {
			try {
				var decoded = jwt.decode(token, CONFIG.AUTH.TOKEN.KEY);
				if (decoded.secret === CONFIG.AUTH.TOKEN.SECRET) {
					return decoded;
				}
			} catch (e) {
				return false;
			}

			return false;
		}
	}
}

// Passport serialization
passport.serializeUser( function(token, callback) {
	callback(null, token);
});

passport.deserializeUser( function(token, callback) {
	callback(null, token);
});

// Facebook strategy
passport.use(new FacebookStrategy({
		clientID: CONFIG.AUTH.facebook.clientID,
		clientSecret: CONFIG.AUTH.facebook.clientSecret,
		callbackURL: CONFIG.AUTH.facebook.callbackURL,
		profileFields: ['id', 'emails', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified']
	},
	function(accessToken, refreshToken, profile, callback) {
		auth.social.validate(accessToken, profile, 'facebook_id', callback);
	}
));

// Linkedin strategy
passport.use(new LinkedInStrategy({
		clientID: CONFIG.AUTH.linkedin.clientID,
		clientSecret: CONFIG.AUTH.linkedin.clientSecret,
		callbackURL: CONFIG.AUTH.linkedin.callbackURL,
		scope: ['r_basicprofile', 'r_emailaddress'],
		state: true
	},
	function(accessToken, refreshToken, profile, callback) {
		auth.social.validate(accessToken, profile, 'linkedin_id', callback);
	}
));

// Twitter strategy
passport.use(new TwitterStrategy({
		consumerKey: CONFIG.AUTH.twitter.consumerKey,
		consumerSecret: CONFIG.AUTH.twitter.consumerSecret,
		callbackURL: CONFIG.AUTH.twitter.callbackURL
	},
	function(accessToken, refreshToken, profile, callback) {
		auth.social.validate(accessToken, profile, 'twitter_id', callback);
	}
));

// Google strategy
passport.use(new GoogleStrategy({
		clientID: CONFIG.AUTH.google.clientID,
		clientSecret: CONFIG.AUTH.google.clientSecret,
		callbackURL: CONFIG.AUTH.google.callbackURL
	},
	function(accessToken, refreshToken, profile, callback) {
		auth.social.validate(accessToken, profile, 'google_id', callback);
	}
));

module.exports = auth;
