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
      payment_id: 'prod_O3FvulwP4Ce2R9',
      price_id: 'price_1NepevIxCEK2HtGeQCpMzsH',
      payment_processor: "stripe",
      name: 'Good Plan',
      description: "Discover the joy of music with Good, the perfect subscription music service for casual listeners. With a vast collection of songs spanning multiple genres, Good provides an affordable and accessible platform to enjoy your favorite tunes anytime, anywhere.",
      price: '9.99',
      is_active: true,
      is_internal: false,
    },
    {
      id: 2,
      payment_id: 'prod_O3JKRLbpMEeOGN',
      price_id: 'price_1NepevIxCdfttGeQCpMzsH',
      payment_processor: "stripe",
      name: 'Better Plan',
      description: "Elevate your music experience with Better, the ultimate subscription music service for true music enthusiasts. Immerse yourself in a world of music like never before.",
      price: '11.99',
      is_active: true,
      is_internal: false,
    },
    {
      id: 3,
      payment_id: 'prod_O3JKfzkqpPN1S7',
      price_id: 'price_1NtbavIxCEK2HtGeQCpMzsH',
      payment_processor: "stripe",
      name: 'Best Plan',
      description: "The ultimate subscription music service for discerning audiophiles. Prepare to be captivated by a music catalog like no other. Access the latest releases, rare tracks, and a vast collection across every genre imaginable.",
      price: '14.99',
      is_active: true,
      is_internal: false,
    }
  ]);

  await knex('entitlements').insert([
    {
      id: 1,
      provider_trigger: 'COMMERCIAL_FREE',
      name: 'Ad Free Music',
      description: 'No Commercials...Ever',
      summary: 'This is a summary of an entitlement.',
      is_active: true,
    },
    {
      id: 2,
      provider_trigger: 'MINIMUM_COMMERCIALS',
      name: 'Minimum Ads',
      description: 'Less Advertising, More Music',
      summary: 'This is a summary of an entitlement.',
      is_active: true,
    },
    {
      id: 3,
      provider_trigger: 'DEAR_ABBY_ACCESS',
      name: 'Dear Abby Access',
      description: 'Access to Read and Write to Dear Abby',
      summary: 'This is a summary of an entitlement.',
      is_active: true,
    },
    {
      id: 4,
      provider_trigger: 'CONCERT_STREAMS',
      name: 'Subscriber Only Concert Streams',
      description: "Get Live Streams of Your Favorite Artist's Concerts",
      summary: 'This is a summary of an entitlement.',
      is_active: true,
    },
    {
      id: 5,
      provider_trigger: 'CONTEST_ENTRY',
      name: 'Special Listener Contests',
      description: 'You are Automatically Entered into Every Contest.',
      summary: 'This is a summary of an entitlement.',
      is_active: true,
    },
    {
      id: 6,
      provider_trigger: 'SUBSCRIBER_PODCASTS',
      name: 'All Access Podcasts',
      description: 'Get Access to All of our Exclusive Podcasts',
      summary: 'This is a summary of an entitlement.',
      is_active: true,
    },
    {
      id: 7,
      provider_trigger: 'MAILING_LIST_NEW_VINYL',
      name: 'New Vinyl Mailing List',
      description: 'A weekly list sent directly to your email account.',
      summary: 'Get the latest release dates for all your favorite artists.',
      is_active: true,
    },
    {
      id: 8,
      provider_trigger: 'EXCLUSIVE_STATIONS_B_SIDE',
      name: 'B Side Exclusive Stations',
      description: "These are Exclusive Stations That Can't Stand Alone",
      summary: 'Stations are Grouped Under One Entitlement.',
      is_active: true,
    },
    {
      id: 9,
      provider_trigger: 'EXCLUSIVE_STATIONS_KROQ',
      name: 'KROQ Exclusive Station',
      description: "An Exclusive Station That Can Stand Alone",
      summary: 'Could Be Sold as a Single Product',
      is_active: true,
    },
    {
      id: 10,
      provider_trigger: 'GO_LIVE_CELEB',
      name: 'Go Live with the Stars',
      description: "Get Exclusive Access to Your Favorire Celebrity",
      summary: 'Get exclusive access to your favorirec elebrity in a small, intimate setting.',
      is_active: true,
    },
  ]);

  await knex('providers').insert([
    {
      id: 1,
      api_key: '1ed55455-d561-52ea-a82c-22b83f7f1155',
      namespace_key: '8383fc53-d438-4f26-91d3-21c99b99f5ea',
      name: 'AmperWave',
      description: 'This is Provider 1.',
      is_active: true,
    },
    {
      id: 2,
      api_key: '69f4533b-fa85-536a-b24a-ed37c800424a',
      namespace_key: '0016df17-acbe-4ed9-8969-c7e355bb89c2',
      name: 'XP',
      description: 'This is Provider 2.',
      is_active: true,
    },
    {
      id: 3,
      api_key: '56e79db7-442f-52da-9184-b697f4c16e8d',
      namespace_key: '78dacd2f-f5c7-472c-8f08-c9b33bfe33e7',
      name: 'Some Third Party',
      description: 'This is Provider 3.',
      is_active: true,
    },
    {
      id: 4,
      api_key: '9eb6411e-43da-4abd-ae51-c4c3f49b0fc4',
      namespace_key: 'd24ced4d-05ee-4cd1-a3ec-49f0b65e9385',
      name: 'Mailing List Bulk Mailer System',
      description: 'Internal mail system for email subscribers to mailing lists.',
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
      unique_identifier: 'b59f52df-cb18-49e7-88bb-0206c1aafaf7',
      payment_id: "payment_id_2345",
      payment_processor: "stripe",
      name: 'Jane Smith',
      is_active: true,
    },
    {
      id: 3,
      unique_identifier: '949d6827-0f93-4d9e-b575-4c54e89952ff',
      payment_id: "payment_id_3456",
      payment_processor: "stripe",
      name: 'Bob Jones',
      is_active: true,
    },
    {
      id: 4,
      unique_identifier: '1d172faf-f487-42a3-bdc2-627c26a17f85',
      payment_id: null,
      payment_processor: null,
      name: 'Claribel Kravitz',
      is_active: true,
    },
  ]);

  await knex('subscriber_to_products').insert([
    {
      product_id: 3,
      unique_identifier: '3d7c4926-39ec-43c5-9dc3-71cf8b928101',
      end_date: '2024-08-03 04:24:43',
    },
    {
      product_id: 1,
      unique_identifier: 'b59f52df-cb18-49e7-88bb-0206c1aafaf7',
      end_date: '2024-08-03 04:24:43',
    },
    {
      product_id: 2,
      unique_identifier: '949d6827-0f93-4d9e-b575-4c54e89952ff',
      end_date: '2024-08-03 04:24:43',
    },
  ]);

  await knex('subscriber_to_entitlements').insert([
    {
      entitlement_id: 1,
      unique_identifier: '3d7c4926-39ec-43c5-9dc3-71cf8b928101',
      end_date: '2024-08-03 04:24:43',
      is_active: true,
    },
    {
      entitlement_id: 3,
      unique_identifier: '3d7c4926-39ec-43c5-9dc3-71cf8b928101',
      end_date: '2024-08-03 04:24:43',
      is_active: true,
    },
    {
      entitlement_id: 4,
      unique_identifier: '3d7c4926-39ec-43c5-9dc3-71cf8b928101',
      end_date: '2024-08-03 04:24:43',
      is_active: true,
    },
    {
      entitlement_id: 5,
      unique_identifier: '3d7c4926-39ec-43c5-9dc3-71cf8b928101',
      end_date: '2024-08-03 04:24:43',
      is_active: true,
    },
    {
      entitlement_id: 6,
      unique_identifier: '3d7c4926-39ec-43c5-9dc3-71cf8b928101',
      end_date: '2024-08-03 04:24:43',
      is_active: true,
    },
    {
      entitlement_id: 2,
      unique_identifier: 'b59f52df-cb18-49e7-88bb-0206c1aafaf7',
      end_date: '2024-08-03 04:24:43',
      is_active: true,
    },
    {
      entitlement_id: 1,
      unique_identifier: '949d6827-0f93-4d9e-b575-4c54e89952ff',
      end_date: '2024-08-03 04:24:43',
      is_active: true,
    },
    {
      entitlement_id: 1,
      unique_identifier: '1d172faf-f487-42a3-bdc2-627c26a17f85',
      end_date: '2024-08-03 04:24:43',
      is_active: true,
    },
    {
      entitlement_id: 10,
      unique_identifier: '3d7c4926-39ec-43c5-9dc3-71cf8b928101',
      end_date: '2024-08-03 04:24:43',
      is_active: true,
    },
  ]);

  await knex('product_to_entitlements').insert([
    {
      entitlement_id: 1,
      product_id: 3,
    },
    {
      entitlement_id: 4,
      product_id: 3,
    },
    {
      entitlement_id: 3,
      product_id: 3,
    },
    {
      entitlement_id: 5,
      product_id: 3,
    },
    {
      entitlement_id: 6,
      product_id: 3,
    },
    {
      entitlement_id: 2,
      product_id: 1,
    },
    {
      entitlement_id: 1,
      product_id: 2,
    },
    {
      entitlement_id: 6,
      product_id: 2,
    },
    {
      entitlement_id: 8,
      product_id: 2,
    },
    {
      entitlement_id: 9,
      product_id: 2,
    },
    {
      entitlement_id: 10,
      product_id: 3,
    },
  ]);

  await knex('provider_to_entitlements').insert([
    {
      provider_id: 1,
      entitlement_id: 1,
    },
    {
      provider_id: 1,
      entitlement_id: 2,
    },
    {
      provider_id: 2,
      entitlement_id: 3,
    },
    {
      provider_id: 2,
      entitlement_id: 5,
    },
    {
      provider_id: 2,
      entitlement_id: 6,
    },
    {
      provider_id: 3,
      entitlement_id: 4,
    },
    {
      provider_id: 3,
      entitlement_id: 1,
    },
    {
      provider_id: 4,
      entitlement_id: 7,
    },
    {
      provider_id: 1,
      entitlement_id: 8,
    },
    {
      provider_id: 1,
      entitlement_id: 9,
    },
  ]);
};
