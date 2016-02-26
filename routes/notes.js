'use strict';

var express = require('express'),
	router = express.Router(),
	auth = app.get('auth'),
	notes = require(BASE_PATH + '/controllers/notes');

// GET
router.get('/',  notes.list);
router.get('/:id',notes.single);

// POST
router.post('/', notes.create);

// PUT
router.put('/:id', notes.update);
//router.put('/password/forgot', users.password.forgot);
//router.put('/password', users.password.change);
//router.put('/profile', auth.allowd(), users.profile.update);

// DELETE
router.delete('/:id', notes.delete);

module.exports = router;
