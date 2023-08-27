/* eslint-disable func-names */
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
// eslint-disable-next-line no-undef
exports.seed = async (knex) => {

  await knex('provider_to_entitlements').del();
  await knex('subscriber_to_entitlements').del();
  await knex('product_to_entitlements').del();
  await knex('subscriber_to_products').del();
  await knex('entitlements').del();
  await knex('products').del();
  await knex('providers').del();
  await knex('subscribers').del();

  await knex('products').insert([
    {
      id: 1,
      payment_id: 'prod_OWG3Pt22qQlMMW',
      price_id: 'price_1NjDXUIxCEK2HtGeZ6Jog7VT',
      payment_processor: "stripe",
      name: 'MVP Starter Package',
      description: "This will be the first of many products in Audacy's new Entitlement System.",
      price: '12.99',
      is_active: true,
      is_internal: false,
    }
  ]);

  await knex('entitlements').insert([
    {
      id: 1,
      provider_trigger: 'MVP_ENTITLEMENT',
      name: 'Single MVP Entitlement',
      description: 'This is the first most basic example of an entitlement.',
      summary: 'This is the first most basic example of an entitlement.',
      is_active: true,
    },
  ]);

  await knex('providers').insert([
    {
      id: 1,
      api_key: '1ed55455-d561-52ea-a82c-22b83f7f1155',
      namespace_key: '8383fc53-d438-4f26-91d3-21c99b99f5ea',
      name: 'AmperWave',
      description: 'Amperwave will be the firat Provider.',
      is_active: true,
    },
  ]);

  await knex('subscribers').insert([
    {
      id: 1,
      unique_identifier: '3d7c4926-39ec-43c5-9dc3-71cf8b928101',
      payment_id: "payment_id_1234",
      payment_processor: "stripe",
      name: 'Jon Smith',
      is_active: true,
    },
    {
      id: 2,
      unique_identifier: '1d172faf-f487-42a3-bdc2-627c26a17f85',
      payment_id: null,
      payment_processor: null,
      name: 'Claribel Kravitz',
      is_active: true,
    },
  ]);

  await knex('subscriber_to_products').insert([
    {
      product_id: 1,
      unique_identifier: '3d7c4926-39ec-43c5-9dc3-71cf8b928101',
      end_date: '2024-08-03 04:24:43',
    },
  ]);

  await knex('subscriber_to_entitlements').insert([
    {
      entitlement_id: 1,
      unique_identifier: '3d7c4926-39ec-43c5-9dc3-71cf8b928101',
      end_date: '2024-06-03',
      is_active: true,
    },
    {
      entitlement_id: 1,
      unique_identifier: '1d172faf-f487-42a3-bdc2-627c26a17f85',
      end_date: '2024-08-03',
      is_active: true,
    },
  ]);

  await knex('product_to_entitlements').insert([
    {
      entitlement_id: 1,
      product_id: 1,
    },
  ]);

  await knex('provider_to_entitlements').insert([
    {
      provider_id: 1,
      entitlement_id: 1,
    },
  ]);
};
