'use strict';

var express = require('express'),
	router = express.Router(),
	auth = app.get('auth'),
	users = require(BASE_PATH + '/controllers/users');

// GET
 router.get('/',  users.list);
// router.get('/:id',users.single);

// POST
router.post('/', users.registration);
router.post('/login', users.login);

// PUT
// router.put('/:id', users.update);
//router.put('/password/forgot', users.password.forgot);
//router.put('/password', users.password.change);
//router.put('/profile', auth.allowd(), users.profile.update);

// DELETE
// router.delete('/:id', users.delete);


module.exports = router;
