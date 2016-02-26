
exports.up = function(knex, Promise) {

  return knex.schema.createTable('notes', function (table) {
      table.increments().primary()

      //id
      table.integer('user_id');

      // Note details
      table.string('title', 35).notNull();
      table.string('description', 200).notNull();
      table.boolean('importance').defaultTo(false);
      table.boolean('is_active').defaultTo(true);

      // Other
      table.timestamps(); // created_at / updated_at
  });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('notes');
};
