const express = require('express');
const router = express.Router();
const { trigger } = require('../controllers/webhooks');

router.post('/', trigger);
  

module.exports = router