'use strict';

// Libs
var utils = app.get('utils'),
    checkit = require('checkit'),
    fs = require('fs-extra'),
    moment = require('moment'),
    md5 = require('md5');

// User Model
var User = Bookshelf.Model.extend({
    tableName: 'users',

    // Initialization
    constructor: function() {
        Bookshelf.Model.apply(this, arguments); // Super
        this.on('creating', this.creating.bind(this));
        this.on('updating', this.updating.bind(this));
        this.on('saving', this.saving.bind(this));
    },

    // Relations

    // Validations
    validation_schema: {
        first_name: ['required', 'maxLength:35'],
        last_name: ['required', 'maxLength:35'],
        password: ['maxLength:32'],
        email: ['required', 'email', 'maxLength:255'],
        temp_email: ['email', 'maxLength:255']
    },

    // Events
    saving: function() {
        return new checkit(this.validation_schema).run(this.toJSON({virtuals: false}));
    },
    creating: function() {
        this.set('created_at', new Date());
        this.set('is_email_confirmed', false);
        return true;
    },
    updating: function() {
        this.set('updated_at', new Date());
        return true;
    },

    // Formatting data
    format_schema: {
        id: ['hidden'],
        first_name: ['unescape', 'not_null'],
        last_name: ['unescape', 'not_null'],
        address: ['unescape', 'not_null'],
        city: ['unescape', 'not_null'],
        country: ['unescape', 'not_null'],
        phone_number: ['unescape', 'not_null'],
        email: ['unescape', 'lowercase', 'not_null'],
        temp_email: ['unescape', 'lowercase', 'not_null'],
        password: ['hidden'],
        action_token: ['hidden'],
        facebook_id: ['hidden'],
        google_id: ['hidden'],
        is_email_confirmed: ['boolean'],
        is_active: ['hidden'],
        last_login: ['hidden'],
        created_at: ['hidden'],
        updated_at: ['hidden']
    },
    toJSON: function () {
        return utils.format.map(this.format_schema, Bookshelf.Model.prototype.toJSON.apply(this, arguments));
    },

    // Virtual data
    virtuals: {
        full_name: function() {
            return this.get('first_name') + ' ' + this.get('last_name');
        }
    }
});

module.exports = Bookshelf.model('User', User);
