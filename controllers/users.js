'use strict';

// Libs
var utils = app.get('utils'),
	auth = app.get('auth'),
	moment = require('moment');

// Models
var User = app.get('User');

// Controller
var users = {
	list: function(req,res){
		// Fetching all users
		new User()
				.fetchAll()
				.asCallback( function (err, users) {
					if (err) { return utils.res.error(res, { message: 'Could not fetch all device types', reason: err, debug: user }); }

					utils.res.ok(res, users);
				});
	},

	// Lgin
	login: function(req, res) {

		// Validation rules
		req.checkBody('email').notEmpty().isEmail();
		req.checkBody('password').len(8, 32);

		// Validation
		var errors = req.validationErrors(true);
		if (errors) { return utils.res.error(res, { message: 'Bad Request', reason: errors }); }

		// Login
		auth.login(req.body.email, req.body.password, function (err, result) {
			if (err || !result.is_authenticated) { return utils.res.error(res, { message: 'Login Failed', reason: err }); }

			var data = _.pick(result, [ 'is_email_confirmed', 'token']);

			if ( CONFIG.DEBUG ) {
				data.keys = result.keys;
			}

			// Response
			utils.res.ok(res, data);
		});
	},

	// Registration
registration: function(req, res) {

	// Cleaning request
	utils.sanitize.escape(req, ['first_name', 'last_name', 'email', 'address', 'city', 'phone_number', 'country']);
	utils.sanitize.trim(req, ['password']);

	// Validation rules
	req.checkBody('first_name').notEmpty();
	req.checkBody('last_name').notEmpty();
	req.checkBody('email').notEmpty().isEmail();
	req.checkBody('password').len(8, 32);

	// Validation
	var errors = req.validationErrors(true);
	if (errors) { return utils.res.error(res, { reason: errors }); }

	// Password encryption
	req.body.password = auth.password.encrypt(req.body.password);

	// Make sure the email is unique
	_users.query()
	.count('id as count')
	.where({ email: req.body.email })
	.then( function(users) {
		if (users[0].count > 0) { return utils.res.error(res, { message: 'User with the same email already exists', debug: users }); }
			// Creating the user
			var data = _.pick(req.body, ['first_name', 'last_name', 'email', 'address', 'city', 'phone_number', 'country']);

			// Generate action token for the user
			var token = auth.token.encode({
				action: 'confirm_email',
				email: data.email
			});

			data.password = req.body.password;
			data.last_login = new Date();
			data.is_active = true;
			data.is_email_confirmed = false;
			data.action_token = token;

			new User(data)
			.save()
			.asCallback( function(err, user) {
				if (err) { return utils.res.error(res, { message: 'Could not create user', reason: err, debug: user }); }

				var keys = {
						active: user.get('is_active'),
						admin: false
					},
					data = {
						success: true,
						is_email_confirmed:true,
						token: auth.token.generate({
							id: user.get('id'),
							keys: keys
						})
					};
				utils.res.created(res, data);
			});
		});
	}
}
var _users = {
	current: function(req, callback) {
		return new User({
			id: auth.get.id(req)
		})
		.fetch({ require: true })
		.asCallback(callback);
	},
	query: function() {
		return Knex('users')
	},
}
module.exports = users;
