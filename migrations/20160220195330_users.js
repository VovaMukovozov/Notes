'use strict';

exports.up = function(knex, Promise) {

    return knex.schema.createTable('users', function (table) {
        table.increments().primary();

        // User details
        table.string('first_name', 35).notNull();
        table.string('last_name', 35).notNull();
        table.string('address');
        table.string('city');
        table.string('country');
        table.string('phone_number');
        table.string('email').unique().notNull();
        table.string('temp_email');
        table.string('password').notNull();
        table.text('action_token');


        // Social provider
        table.string('facebook_id');
        table.string('google_id');

        // Permission keys details
        table.boolean('is_active').defaultTo(false).notNull();

        // Preferences
        table.boolean('is_email_confirmed').defaultTo(false).notNull();

        // Other
        table.datetime('last_login');
        table.timestamps(); // created_at / updated_at
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('users');
};
