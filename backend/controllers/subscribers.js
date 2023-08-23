const knex = require('knex')(require('../knex/knexfile'));
const Products = require('./products');

const getAll = (req, res) => {
  return knex('subscribers')
    .then((result) => {
      res.header('Access-Control-Expose-Headers', 'Content-Range');
      res.header('Content-Range', result.length);
      res.json(result);
    })
    .catch((error) => {
      console.error(error);
    });
}

const getOne = async (req, res) => {
  return knex('subscribers')
    .where('id', req.params.id)
    .first()
    .then(async (subscriber) => {
      if (!subscriber) {
        res.status(404);
        res.json({ status: 404, message: 'Subscriber Not Found' });
      }

      const getEntitlements = await knex.select(knex.raw("array_agg(json_build_object('id', e.id,'name', e.name, 'e_is_active', e.is_active, 'is_active', se.is_active, 'start_date', se.start_date::date, 'end_date', se.end_date::date)) as entitlements"))
        .from('entitlements as e')
        .innerJoin('subscriber_to_entitlements as se', 'se.entitlement_id', 'e.id')
        .where('se.unique_identifier', subscriber.unique_identifier).first();
      subscriber.entitlements = getEntitlements.entitlements;

      const getProducts = await knex.select(knex.raw("array_agg(json_build_object('id', pr.id,'name', pr.name, 'is_active', pr.is_active, 'start_date', sp.start_date::date, 'end_date', sp.end_date::date)) as products"))
        .from('products as pr')
        .innerJoin('subscriber_to_products as sp', 'sp.product_id', 'pr.id')
        .where('sp.unique_identifier', subscriber.unique_identifier).first();
      subscriber.products = getProducts.products;

      res.json(subscriber);
    })
    .catch((error) => {
      res.json({ status: res.statusCode, message: error.toString() });
    })
}

const create = (req, res) => {
  return knex('subscribers')
    .insert(req.body)
    .returning('*')
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



const update = (req, res) => {
  let { id,
    payment_id,
    payment_session_id,
    payment_processor,
    unique_identifier,
    entitlements,
    newEntitlements = [],
    products,
    newProducts,
    ...updateBody } = req.body;
  return knex('subscribers')
    .update(updateBody)
    .where('id', req.params.id)
    .returning('*')
    .then(async (result) => {
      if (!result) {
        res.status(404);
        res.json({ status: 404, message: 'Not Found' });
      }

      if (newProducts) {
        const pInsert = []
        newProducts.forEach((p) => { pInsert.push({ product_id: p, unique_identifier: result[0].unique_identifier }) })
        await knex('subscriber_to_products')
          .insert(pInsert)
          .onConflict(['unique_identifier', 'product_id'])
          .merge()
          .catch((err) => { console.log(err) });
        const newProductsEntitlements = await Products.getProductsEntitlements(newProducts);
        newEntitlements = [...new Set([...newEntitlements, ...newProductsEntitlements[0].entitlements])]
      }

      if (newEntitlements) {
        const eInsert = []
        newEntitlements.forEach((e) => {
          eInsert.push({ entitlement_id: e, unique_identifier: result[0].unique_identifier })
        })
        await knex('subscriber_to_entitlements')
          .insert(eInsert)
          .onConflict(['unique_identifier', 'entitlement_id'])
          .merge()
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
  return knex('subscribers')
    .update({ is_active: false, end_date: knex.fn.now() })
    .where('id', req.params.id)
    .returning('*')
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

module.exports = { getAll, getOne, create, update, setInactive };
