const express = require('express');
const router = express.Router();
const { getAll, getOne, create, setInactive, update } = require('../controllers/subscribers');

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', setInactive);

module.exports = router