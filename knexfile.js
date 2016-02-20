// Update with your config settings.

module.exports = {

  development: {
    client: 'mysql',
    connection: {
      database: 'note',
      user:     'root',
      password: 'admin1234'
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
