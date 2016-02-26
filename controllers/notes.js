'use strict';

// Libs
var utils = app.get('utils'),
	auth = app.get('auth'),
	moment = require('moment');

// Models
var Note = app.get('Note');

// Controller
var notes = {
	list: function(req,res){
		utils.log(auth.get.id(req));
		// Fetching all notes
		new Note()
				.fetchAll({
					columns: ['id', 'title', 'description', 'importance']
				})
				.asCallback( function (err, notes) {
					if (err) { return utils.res.error(res, { message: 'Could not fetch all notes', reason: err, debug: notes }); }
					if (_.isEmpty(notes)) { return utils.res.not_found(res, { message: 'Could not fetch note' }); }
					utils.res.ok(res, notes);
				});
	},
	   //Creating new note
		 create: function(req,res){

			// validation
			req.checkBody('title').notEmpty();
			req.checkBody('description').notEmpty();
			var errors = req.validationErrors(true);
			if(errors) { return utils.res.error(res, { message: errors})}

			new Note(_.pick(req.body, ['title', 'description', 'importance']))
				.save()
				.asCallback(function (err, note) {
					if (err) { return utils.res.error(res, { message: 'Could not create note', reason: err, debug: note }); }
					utils.res.created(res, note);
				});
		},

	single: function(req,res){

		// validation
		req.checkParams('id').notEmpty().isInt();
		var errors = req.validationErrors(true);
		if(errors) { return utils.res.error(res, { message: errors});}

				// Fetching note by id
		  new Note({id: req.params.id})
					.fetch({
						columns: ['id', 'title', 'description', 'importance']
					})
					.asCallback(function (err, note) {
						if (err) { return utils.res.error(res, { message: 'Could not fetch note', reason: err, debug: notes }); }
						if (_.isEmpty(note)) { return utils.res.not_found(res, { message: 'Could not fetch note' }); }
						utils.res.ok(res, note);
					});
	},

	// Updating note data
	update: function(req,res){
		// validation
		req.checkParams('id').notEmpty().isInt();
		var errors = req.validationErrors(true);
		if(errors) { return utils.res.error(res, { message: errors});}

		var data = _.pick(req.body, ['title', 'description', 'importance']);

		new Note({id: req.params.id})
				.fetch({require: true})         // set id
				.asCallback(function (err, note) {
					if (err) { return utils.res.error(res, { message: 'Could not fetch note', reason: err, debug: note }); }
					if (_.isEmpty(note)) { return utils.res.not_found(res, { message: 'Could not fetch note' }); }
					note.save(data)
					.asCallback(function (err, updatedNote) {
						if (err) { return utils.res.error(res, { message: 'Could not update user', reason: err, debug: updatedNote }); }
						utils.res.ok(res, updatedNote);
					})
				});
			},

	// Deleting note by id

	delete: function(req,res){
		//Validation
		req.checkParams('id').notEmpty().isInt();
		var errors = req.validationErrors(true);
		if(errors) { return utils.res.error(res, { message: errors});}

		new Note({id: req.params.id})
				.fetch({require: true})         // set id
				   .asCallback(function (err,note) {
							if (err) { return utils.res.error(res, { message: 'Could not fetch note', reason: err, debug: note }); }
							if (_.isEmpty(note)) { return utils.res.not_found(res, { message: 'Could not fetch note' }); }
							note.destroy()
				    .asCallback(function (err, deletedNote) {
								if (err) { return utils.res.error(res, { message: 'Could not delete notes', reason: err, debug: notes }); }
								utils.res.deleted(res, notes);
				})
	});
}
}
module.exports = notes;
