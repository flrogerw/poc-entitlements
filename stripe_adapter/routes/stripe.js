const express = require('express');
const router = express.Router();
const { getRecovery, createIntent, checkoutSession, portalSession, webhook  } = require('../controllers/stripe');

router.get('/recovery', getRecovery);
router.post('/createintent', createIntent);
router.post('/create-checkout-session', checkoutSession);
router.post('/create-portal-session', portalSession);
router.post('/webhook', express.raw({ type: 'application/json' }), webhook);


module.exports = router
