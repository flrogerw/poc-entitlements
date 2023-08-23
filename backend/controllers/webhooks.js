const knex = require('knex')(require('../knex/knexfile'));

const create = () => {

}
const update = () => {
  
}

const trigger = (req, res) => {
  res.send('OK');
    res.send(req.body);
  }

  module.exports = { trigger };