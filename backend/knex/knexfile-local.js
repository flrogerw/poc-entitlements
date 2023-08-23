// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
*/
module.exports = {
  client: 'pg',
  connection: {
    host: 'localhost',
    database: 'entitlements',
    user: 'postgres',
    password: 'postgres',
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: 'knex_migrations'
  },
};

