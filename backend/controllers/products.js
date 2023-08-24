const knex = require('knex')(require('../knex/knexfile'));
const redis = require('redis');
const axios = require('axios');

const client = redis.createClient({
  socket: {
    host: 'poc-entitlements-redis-1',
    port: 6379
  }
});

const paymentAdapter = axios.create({
  baseURL: 'http://poc-entitlements-stripe_adapter-1:8082',
  timeout: 1000
});

const getProductsEntitlements = async (newProductsArray) => {
  return await knex.select(knex.raw("array_agg(DISTINCT entitlement_id) as entitlements"))
    .from('product_to_entitlements')
    .whereRaw('product_id IN (?)', newProductsArray.toString());
}

const getEntitlements = async (id) => {
  return await knex.select(knex.raw("row_to_json(e) as entitlements"))
    .from('entitlements as e')
    .innerJoin('product_to_entitlements as pe', 'pe.entitlement_id', 'e.id')
    .where('pe.product_id', id)
    .then((entitlements) => {
      return entitlements.map(p => p.entitlements);
    })
    .catch((err) => {
      console.log(err);
    });
}

const getAll = async (req, res) => {
  return knex
    .from('products as pr')
    .orderBy('id')
    .modify((queryBuilder) => {
      if (req.query.entitlements) {
        // This will crap out if a product has no entitlements.  Need to modify like the other getEntitlements.
        queryBuilder.select(knex.raw("pr.*, array_agg(json_build_object('name', e.name, 'description', e.description)) as entitlements"))
        queryBuilder.innerJoin('product_to_entitlements as pe', 'pe.product_id', 'pr.id')
        queryBuilder.innerJoin('entitlements as e', 'pe.entitlement_id', 'e.id')
        queryBuilder.groupBy("pr.id")
      }
    })
    .then((result) => {
      res.header('Access-Control-Expose-Headers', 'Content-Range');
      res.header('Content-Range', result.length);
      if (req.query.entitlements) {
      }
      res.json(result);
    })
    .catch((error) => {
      console.error(error);
    });
}


const getOne = async (req, res) => {
  return knex
    .select('*')
    .from('products as pr')
    .where('pr.id', req.params.id)
    .first()
    .then(async (result) => {
      if (!result) {
        res.status(404);
        res.json({ status: 404, message: 'Not Found' });
      }
      result.entitlements = await getEntitlements(req.params.id);
      res.json(result);
    })
    .catch((error) => {
      res.json({ status: res.statusCode, message: error.toString() });
    })
}

const create = async (req, res) => {
  const { id, entitlements, ...productCreate } = req.body;
  let productId;
  const entitlementsInsert = [];
  return knex('products')
    .insert(productCreate)
    .returning('*')
    .then(async (result) => {
      if (!result) {
        res.status(404);
        res.json({ status: 404, message: 'Not Found' });
      }
      const product = result[0];
      const { id, is_internal } = product;
      // Build entitlement inserts
      entitlements.forEach((e) => {
        entitlementsInsert.push({ entitlement_id: e, product_id: id });
      })

      if (entitlementsInsert.length > 0) {
        await knex('product_to_entitlements').insert(entitlementsInsert)
          .catch((err) => {
            console.log(err);
          });
      }
      // Call stripe and create product
      if (!is_internal) {
        paymentAdapter.post('/products', result[0])
          .then(async (r) => {
            const { product, price } = r.data;
            return knex('products')
              .update({
                payment_id: product.id,
                payment_processor: process.env.PAYMENT_PROCESSOR,
                price_id: price.id
              })
              .where('id', id)
              .returning('*')
              .then((result) => {
                res.json(result[0]);
              })
              .catch((err) => {
                throw err;
              });
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        res.json(product);
      }

    })
    .catch((error) => {
      console.log(error);
      res.status(500);
      res.json({ status: res.statusCode, message: error.toString() });
    })
}

const update = (req, res) => {
  const { id, newEntitlements, entitlements, ...updateBody } = req.body;
  return knex('products')
    .update(updateBody)
    .where('id', req.params.id)
    .returning('*')
    .then(async (result) => {
      if (!result) {
        res.status(404);
        res.json({ status: 404, message: 'Not Found' });
      }

      if (newEntitlements) {
        const eInsert = []
        newEntitlements.forEach((e) => { eInsert.push({ entitlement_id: e, product_id: id }) })
        await knex('product_to_entitlements')
          .insert(eInsert)
          .onConflict(['entitlement_id', 'product_id'])
          .ignore() // if table has timestamp use .merge() here to update the end_date
          .catch((err) => { console.log(err) });
      }
      res.json(result[0]);
    })
    .catch((error) => {
      res.status(500);
      res.json({ status: res.statusCode, message: error.toString() });
    })
}

const setInactive = (req, res) => {
  return knex('products')
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
      res.status(500);
      res.json({ status: res.statusCode, message: error.toString() });
    })
}

module.exports = { getAll, getOne, create, update, setInactive, getProductsEntitlements };
