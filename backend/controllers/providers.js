const knex = require('knex')(require('../knex/knexfile'));
const redis = require('redis');

const client = redis.createClient({
  socket: {
    host: 'poc-entitlements-redis-1',
    port: 6379
  }
});

const getAll = (req, res) => {
  return knex('providers')
    .then((result) => {
      res.header('Access-Control-Expose-Headers', 'Content-Range');
      res.header('Content-Range', result.length);
      res.json(result);
    })
    .catch((error) => {
      res.status(500);
      res.json({ status: res.statusCode, message: error.toString() });
    })
}

const getOne = (req, res) => {
  return knex
    .select(knex.raw('pr.*, array_agg(row_to_json(t.*)) as entitlements'))
    .from('providers as pr')
    .leftJoin('provider_to_entitlements as it', 'it.provider_id', 'pr.id')
    .leftJoin('entitlements as t', 't.id', 'it.entitlement_id')
    .groupBy('pr.id', 'pr.name')
    .where('pr.id', req.params.id)
    .first()
    .then((result) => {
      if (!result) {
        res.status(404);
        res.json({ status: 404, message: 'Not Found' });
      }
      res.json(result);
    })
    .catch((error) => {
      res.json({ status: res.statusCode, message: error.toString() });
    })
}

const create = (req, res) => {
  return knex('providers')
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
      res.status(502);
      res.json({ status: res.statusCode, message: error.toString() });
    })
}

const update = (req, res) => {
  const { id, namespace_key, newEntitlements, entitlements, ...updateBody } = req.body;
  return knex('providers')
    .update(updateBody)
    .where('id', req.params.id)
    .returning('*')
    .then(async (result) => {
      if (!result) {
        res.status(404);
        res.json({ status: 404, message: 'Not Found' });
      }
     let provider = result[0];

      if (newEntitlements) {
        const eInsert = []
        newEntitlements.forEach((e) => {
          eInsert.push({ entitlement_id: e, provider_id: id })
        })
        await knex('provider_to_entitlements')
          .insert(eInsert)
          .onConflict(['entitlement_id', 'provider_id'])
          .ignore()
          .catch((err) => { console.log(err) });
      }
      res.send(provider);
    })
    .catch((error) => {
      res.status(502);
      res.json({ status: res.statusCode, message: error.toString() });
    })
}

const setInactive = (req, res) => {
  return knex('providers')
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

module.exports = { getAll, getOne, create, update, setInactive };
