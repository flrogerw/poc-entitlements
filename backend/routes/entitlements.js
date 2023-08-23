const express = require('express');
const router = express.Router();
const { getAll, getOne, create, setInactive, update, getUserEntitlements  } = require('../controllers/entitlements');

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', setInactive);

// Endpoint to retrieve user entitlements
router.get('/subscriber/:id', getUserEntitlements); 
  

module.exports = router