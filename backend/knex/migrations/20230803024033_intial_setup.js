/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => knex.schema.createTable('products', (table) => {
  table.increments('id').primary();
  table.string('payment_id', 32).unique();
  table.string('price_id', 32).unique();
  table.string('payment_processor', 32);
  table.string('name', 64).unique().notNullable();
  table.text('description');
  table.float('price', 2);
  table.boolean('is_active').defaultTo(true);
  table.boolean('is_internal').defaultTo(false);
  table.date('start_date').defaultTo(knex.fn.now());
  table.date('end_date');
})
  .raw('ALTER SEQUENCE products_id_seq RESTART WITH 1000')

  .createTable('entitlements', (table) => {
    table.increments('id').primary();
    table.string('provider_trigger', 64).unique().notNullable();
    table.string('name', 64).unique().notNullable();
    table.string('description', 256);
    table.string('summary', 256);
    table.boolean('is_active').defaultTo(true);
    table.date('start_date').defaultTo(knex.fn.now());
    table.date('end_date');
  })

  .raw('ALTER SEQUENCE entitlements_id_seq RESTART WITH 1000')

  .createTable('subscribers', (table) => {
    table.increments('id').primary();
    table.string('payment_id', 64).unique();
    table.string('payment_session_id', 64).unique();
    table.string('payment_processor', 32);
    table.string('name', 64);
    table.uuid('unique_identifier').notNullable().unique();
    table.boolean('is_active').defaultTo(true);
    table.date('start_date').defaultTo(knex.fn.now());
    table.date('end_date');
  })

  .raw('ALTER SEQUENCE subscribers_id_seq RESTART WITH 1000')

  .createTable('providers', (table) => {
    table.increments('id').primary();
    table.uuid('api_key').unique().notNullable();
    table.uuid('namespace_key').unique().notNullable();
    table.string('name', 64).unique().notNullable();
    table.string('description', 256);
    table.boolean('is_active').defaultTo(true);
    table.date('start_date').defaultTo(knex.fn.now());
    table.date('end_date');
  })

  .raw('ALTER SEQUENCE providers_id_seq RESTART WITH 1000')

  .createTable('product_to_entitlements', (table) => {
    table.primary(['entitlement_id', 'product_id']);
    table.integer('entitlement_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('entitlements');
    table.integer('product_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('products');
  })

  .createTable('subscriber_to_products', (table) => {
    table.primary(['unique_identifier', 'product_id']);
    table.uuid('unique_identifier').notNullable();
    table.integer('product_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('products');
    table.date('start_date').defaultTo(knex.fn.now());
    table.date('end_date');
  })

  .createTable('subscriber_to_entitlements', (table) => {
    table.primary(['unique_identifier', 'entitlement_id']);
    table.uuid('unique_identifier').notNullable();
    table.integer('entitlement_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('entitlements');
    table.boolean('is_active').defaultTo(true);
    table.date('start_date').defaultTo(knex.fn.now());
    table.date('end_date');
  })

  .createTable('provider_to_entitlements', (table) => {
    table.primary(['provider_id', 'entitlement_id']);
    table.integer('entitlement_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('entitlements');
    table.integer('provider_id')
      .notNullable()
      .references('id')
      .inTable('providers');
  });

/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
  knex.schema.dropTable('product_to_entitlements');
  knex.schema.dropTable('subscriber_to_products');
  knex.schema.dropTable('provider_to_entitlements');
  knex.schema.dropTable('subscriber_to_entitlements');
  knex.schema.dropTable('products');
  knex.schema.dropTable('entitlements');
  knex.schema.dropTable('providers');
  knex.schema.dropTable('subscribers');
};
