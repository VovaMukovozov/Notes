'use strict';

// Libs
var utils = app.get('utils'),
    checkit = require('checkit'),
    fs = require('fs-extra'),
    moment = require('moment'),
    User = app.get('User'),
    md5 = require('md5');

// User Model
var Note = Bookshelf.Model.extend({
    tableName: 'notes',

    // Initialization
    constructor: function() {
        Bookshelf.Model.apply(this, arguments); // Super
        this.on('creating', this.creating.bind(this));
        this.on('updating', this.updating.bind(this));
        this.on('saving', this.saving.bind(this));
    },

    // Relations
    user : function(){
         return this.belongsTo(User,'user_id');
    },
    // Validations
    validation_schema: {
        title: ['required', 'maxLength:35'],
        description: ['required', 'maxLength:200'],
        importance: ['maxLength:32'],

    },

    // Events
    saving: function() {
        return new checkit(this.validation_schema).run(this.toJSON({virtuals: false}));
    },
    creating: function() {
        this.set('created_at', new Date());
        return true;
    },
    updating: function() {
        this.set('updated_at', new Date());
        return true;
    },

    // Formatting data
    format_schema: {
        id: ['unescape'],
        user_id: ['hidden'],
        title: ['unescape', 'not_null'],
        description: ['unescape', 'not_null'],
        importance: ['unescape', 'not_null'],
        created_at: ['hidden'],
        updated_at: ['hidden']
    },
    toJSON: function () {
        return utils.format.map(this.format_schema, Bookshelf.Model.prototype.toJSON.apply(this, arguments));
    }
});

module.exports = Bookshelf.model('Note', Note);
