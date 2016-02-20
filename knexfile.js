// Update with your config settings.

module.exports = {

  development: {
    client: 'mysql',
    connection: {
      database: 'note',
      user:     'root',
      password: ''
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
