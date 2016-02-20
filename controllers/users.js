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
}
module.exports = users;
