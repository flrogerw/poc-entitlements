require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_TOKEN);
const express = require('express');
const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
const stripeRoute = require('./routes/stripe');


function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  res.status(500)
  res.render('error', { error: err })
}

// Routes
app.use('/', stripeRoute);

app.use(errorHandler)
app.use(express.json());

// Left this one in server because some stripe routes break using express.json but this route needs it.
// Will enevtually need to moved out to the stripe routes.
app.post('/products', async (req, res) => {
  const product = req.body;
  // Create a new Stripe product
  const productData = {
      "active": product.is_active,
      "name": product.name,
      "description": product.description,
      "metadata": {
          "audacy_product_id": product.id
      }
  };
  try {
      const stripeProduct = await stripe.products.create(productData);

      // Create a Stripe price object for the new product
      const priceData = {
          currency: 'usd',
          active: product.is_active,
          product: stripeProduct.id,
          recurring: { interval: 'month', interval_count: 1 },
          unit_amount: parseInt(product.price * 100)
      }
      const stripePrice = await stripe.prices.create(priceData);
      res.json({ product: stripeProduct, price: stripePrice });
  } catch (err) {
      res.send(err);
  }
});

app.listen(8082, () => console.log('Running on port 8082'));