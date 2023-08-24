const knex = require('knex')(require('../knex/knexfile'));
const redis = require('redis');
const { v5: uuid } = require('uuid');

const client = redis.createClient({
  socket: {
    host: 'poc-entitlements-redis-1',
    port: 6379
  }
});


// Predefined UUIDs for different API keys (This should be cached)
const namespaceUUIDs = {
  '1ed55455-d561-52ea-a82c-22b83f7f1155': {
    namespace: '8383fc53-d438-4f26-91d3-21c99b99f5ea',
    id: 1
  },
  '69f4533b-fa85-536a-b24a-ed37c800424a': {
    namespace: '0016df17-acbe-4ed9-8969-c7e355bb89c2',
    id: 2
  },
  '56e79db7-442f-52da-9184-b697f4c16e8d': {
    namespace: '78dacd2f-f5c7-472c-8f08-c9b33bfe33e7',
    id: 3
  },
  '9eb6411e-43da-4abd-ae51-c4c3f49b0fc4': {
    namespace: 'd24ced4d-05ee-4cd1-a3ec-49f0b65e9385',
    id: 4
  },
};

const getProviders = async (id) => {
  return await knex.select(knex.raw("row_to_json(r) as providers"))
    .from('providers as r')
    .leftJoin('provider_to_entitlements as re', 're.provider_id', 'r.id')
    .where('re.entitlement_id', id)
    .then((providers) => {
      return providers.map(p => p.providers);
    })
    .catch((err) => {
      console.log(err);
    });
}

const getProducts = async (id) => {
  return await knex.select(knex.raw("row_to_json(r) as products"))
    .from('products as r')
    .rightJoin('product_to_entitlements as re', 're.product_id', 'r.id')
    .where('re.entitlement_id', id)
    .then((products) => {
      return products.map(p => p.products);
    })
    .catch((err) => {
      console.log(err);
    });
}

// Function to fetch user entitlements from the database
function getEntitlements(id, providerKey) {
  return knex
    .select(knex.raw('json_object_agg(e.provider_trigger, extract(epoch from se.end_date)::bigint)'))
    .from('entitlements as e')
    .leftJoin('subscriber_to_entitlements as se', 'e.id', 'se.entitlement_id')
    .leftJoin('provider_to_entitlements as re', 're.entitlement_id', 'se.entitlement_id')
    .where('se.unique_identifier', id)
    .andWhere('e.is_active', true)
    .andWhere('se.end_date', '>', knex.raw('CURRENT_TIMESTAMP'))
    .andWhere('re.provider_id', providerKey)
    .then((result) => {
      return result[0].json_object_agg;;
    })
    .catch((error) => {
      console.error(error);
    });
}

const getAll = (req, res) => {
  return knex('entitlements')
    .then((result) => {
      res.header('Access-Control-Expose-Headers', 'Content-Range');
      res.header('Content-Range', result.length);
      res.json(result);
    })
    .catch((error) => {
      console.error(error);
    })
}


const getOne = async (req, res) => {
  knex('entitlements')
    .where('id', req.params.id)
    .first()
    .then(async (entitlement) => {
      if (!entitlement) {
        res.status(404);
        res.json({ status: 404, message: 'Not Found' });
      }
      entitlement.providers = await getProviders(req.params.id);
      entitlement.products = await getProducts(req.params.id);
      res.json(entitlement);
    })
    .catch((error) => {
      res.json({ status: res.statusCode, message: error.toString() });
    })
}

const create = (req, res) => {
  const { providers, id, ...postBody } = req.body;
  const providersInsert = [];
  return knex('entitlements')
    .insert(postBody)
    .returning('*')
    .then(async (result) => {
      if (!result) {
        res.status(404);
        res.json({ status: 404, message: 'Not Found' });
      }

      // Build Provider inserts
      providers.forEach((p) => {
        providersInsert.push({ entitlement_id: result[0].id, provider_id: p });
      })

      if (providersInsert.length > 0) {
        await knex('provider_to_entitlements').insert(providersInsert)
          .catch((err) => {
            console.log(err);
          });
      }
      res.json(result[0]);
    })
    .catch((error) => {
      res.status(502);
      res.json({ status: res.statusCode, message: error.toString() });
    })
}

const update = (req, res) => {
  const { id, newProviders, products, providers, ...putBody } = req.body;
  return knex('entitlements')
    .update(putBody)
    .where('id', req.params.id)
    .returning('*')
    .then(async (result) => {
      if (!result) {
        res.status(404);
        res.json({ status: 404, message: 'Not Found' });
      }

      if (newProviders) {
        const pInsert = []
        newProviders.forEach((r) => { pInsert.push({ entitlement_id: id, provider_id: r }) })
        await knex('provider_to_entitlements')
          .insert(pInsert)
          .onConflict(['provider_id', 'entitlement_id'])
          .ignore()
          .catch((err) => { console.log(err) });
      }
      result[0].products = [];
      result[0].providers = [];
      res.json(result[0]);
    })
    .catch((error) => {
      res.status(502);
      console.log(error);
      res.json({ status: res.statusCode, message: error.toString() });
    })
}

const setInactive = (req, res) => {
  return knex('entitlements')
    .update({ is_active: false, end_date: knex.fn.now() })
    .where('id', req.params.id)
    .then((result) => {
      if (!result) {
        res.status(404);
        res.json({ status: 404, message: 'Not Found' });
      }
      res.json(result[0]);
    })
    .catch((error) => {
      res.status(502);
      res.json({ status: res.statusCode, message: error.toString() });
    })
}

const getUserEntitlements = async (req, res) => {
  let userEntitlements;
  let isCached = false;
  //  This will be replaced by parsing the JWT
  const { id } = req.params;
  const token = req.headers.authorization.split(' ')[1];
  const redisKey = uuid(id, namespaceUUIDs[token].namespace);

  await client.connect();
  client.on('error', (err) => console.log('Redis Server Error', err));

  try {
    const cacheResults = await client.get(redisKey);
    if (cacheResults) {
      isCached = true;
      userEntitlements = JSON.parse(cacheResults);
    } else {
      userEntitlements = await getEntitlements(id, namespaceUUIDs[token].id);
    }

    console.log('From Cache: ', isCached);
    res.json(userEntitlements);

    await client.set(redisKey, JSON.stringify(userEntitlements), 'EX', 120); // Expire in 2 min.
    await client.quit();
  } catch (error) {
    res.status(502);
    res.json({ status: res.statusCode, message: error.toString() });
  }
}
module.exports = { getAll, getOne, create, update, setInactive, getUserEntitlements };
