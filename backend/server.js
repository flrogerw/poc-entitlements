const express = require('express');
const cors = require('cors');
const swaggerUI = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const yaml = require('js-yaml');
const fs = require('fs');
require('dotenv').config();
const products = require('./routes/products');
const entitlements = require('./routes/entitlements');
const requestors = require('./routes/providers');
const members = require('./routes/subscribers');
const webhooks = require('./routes/webhooks');

// Create an Express application
const app = express();
app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Routes
app.use('/products', products);
app.use('/entitlements', entitlements);
app.use('/providers', requestors);
app.use('/subscribers', members);
app.use('/webhooks', webhooks);

// eslint-disable-next-line consistent-return
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  res.status(500);
  res.render('error', { error: err });
}

const data = fs.readFileSync('./public/swagger/index.yml', 'utf8');
const options = {
  swaggerDefinition: yaml.load(data),
  apis: ['./public/swagger/*.yaml'],
};

app.use('/api-doc', swaggerUI.serve, swaggerUI.setup(swaggerJSDoc(options)));
app.use(errorHandler);
app.listen(8080, () => console.log('Running on port 8080'));
