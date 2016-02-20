'use strict';

var express = require('express'),
	router = express.Router(),
	auth = app.get('auth'),
	users = require(BASE_PATH + '/controllers/users');

// GET
router.get('/',  users.list);

// POST
//router.post('/', users.register.registration);

// PUT
//router.put('/confirm/email', users.profile.confirmEmail);
//router.put('/password/forgot', users.password.forgot);
//router.put('/password', users.password.change);
//router.put('/profile', auth.allowd(), users.profile.update);

// DELETE


module.exports = router;
