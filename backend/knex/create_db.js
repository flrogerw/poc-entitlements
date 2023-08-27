const Knex = require('knex');
const db_name = 'entitlements';

async function main() {
    let knex = Knex({
        client: 'pg',
        connection: {
            host: 'localhost',
            user: 'postgres',
            password: 'postgres'
        }
    });

    await knex.raw('DROP DATABASE IF EXISTS ??', db_name);
    await knex.raw('CREATE DATABASE ??', db_name);

}

main().catch(console.log).then(process.exit);