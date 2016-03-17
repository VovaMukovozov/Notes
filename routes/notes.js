'use strict';

var express = require('express'),
	router = express.Router(),
	auth = app.get('auth'),
	notes = require(BASE_PATH + '/controllers/notes');

// GET
router.get('/' , auth.allowd(),  notes.list);                            //
router.get('/:id', auth.allowd(), notes.single);

// POST
router.post('/', auth.allowd(), notes.create);

// PUT
router.put('/:id', auth.allowd(), notes.update);
//router.put('/password/forgot', users.password.forgot);
//router.put('/password', users.password.change);
//router.put('/profile', auth.allowd(), users.profile.update);

// DELETE
router.delete('/:id', auth.allowd(),  notes.delete);     //

module.exports = router;
