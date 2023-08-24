const knex = require('knex')(require('../knex/knexfile'));
const Products = require('./products');
const { v4: uuidv4 } = require('uuid');
// Fixes dates in knex/pg
const { types } = require('pg');
const DATE_OID = 1082;
const parseDate = (value) => value;
types.setTypeParser(DATE_OID, parseDate);

const getEntitlements = async (unique_identifier) => {
  return await knex.select('se.end_date as client_end_date', knex.raw("row_to_json(e) as entitlements"))
    .from('entitlements as e')
    .innerJoin('subscriber_to_entitlements as se', 'se.entitlement_id', 'e.id')
    .where(`se.unique_identifier`, unique_identifier)
    .then((entitlements) => {
      return entitlements.map(p => {
        p.entitlements.end_date = p.client_end_date;
        return p.entitlements;
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

const getProducts = async (unique_identifier) => {
  return await knex.select('sp.end_date as client_end_date', knex.raw("row_to_json(pr) as products"))
    .from('products as pr')
    .innerJoin('subscriber_to_products as sp', 'sp.product_id', 'pr.id')
    .where('sp.unique_identifier',unique_identifier)
    .then((products) => {
      return products.map(p => {
        p.products.end_date = p.client_end_date;
        return p.products;
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

const createSubscriber = (subscriberObj) => {
  let { id, end_date, newEntitlements, newProducts, ...subscriberCreate } = subscriberObj;
  newEntitlements ||= [];
  newProducts ||= [];
  subscriberCreate.unique_identifier ||= uuidv4();
  return knex('subscribers')
    .insert(subscriberCreate)
    .returning('*')
    .then(async (result) => {
      if (!result) {
        throw ({ status: 404, message: 'Not Found' });
      }
      const subscriber = result[0];
      await addProductEntitlements(newProducts, newEntitlements, subscriber.unique_identifier, end_date)
      return subscriber;
    })
    .catch((error) => {
      throw  { status: 500, message: error.toString() };
    })
}


const addProductEntitlements = async (newProducts, newEntitlements, unique_identifier, endDate = null) => {

  if (newProducts) {
    const pInsert = []
    newProducts.forEach((p) => { pInsert.push({ product_id: p, unique_identifier, end_date: endDate }) })
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
      eInsert.push({ entitlement_id: e, unique_identifier: unique_identifier, end_date: endDate })
    })
    await knex('subscriber_to_entitlements')
      .insert(eInsert)
      .onConflict(['unique_identifier', 'entitlement_id'])
      .merge()
      .catch((err) => { console.log(err) });
  }
}

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
      subscriber.entitlements = await getEntitlements(subscriber.unique_identifier);
      subscriber.products = await getProducts(subscriber.unique_identifier);
      res.json(subscriber);
    })
    .catch((error) => {
      res.json({ status: res.statusCode, message: error.toString() });
    })
}


const create = async (req, res) => {
  try {
    const subscriber = await createSubscriber(req.body);
    res.json(subscriber);
  } catch (error) {
    console.log(error);
    res.status(error.status);
    res.json({ status: error.status, message: error.toString() });
  }
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
      await addProductEntitlements(newProducts, newEntitlements, result[0].unique_identifier)
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

module.exports = { createSubscriber, getAll, getOne, create, update, setInactive };
