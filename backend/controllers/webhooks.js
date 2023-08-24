const knex = require('knex')(require('../knex/knexfile'));
const Subscribers = require('./subscribers');

const create = async (triggerObj) => {
  const { event, type, status } = triggerObj;
  console.log(type, event, status);
  console.log(triggerObj);
}

const update = async (triggerObj) => {
  const { event, type, status, processor, paymentId, metadata } = triggerObj;
  console.log(type, event, status);
  console.log(triggerObj);
  // adds new Subscriber.  This needs to be a little more generic/de-coupled for multi payment scenario.
  if (type == 'subscription' && status == 'active') {
    const date = new Date();
    date.setDate(date.getDate() + 30); 
    await Subscribers.createSubscriber({
      unique_identifier: metadata.unique_identifier,
      newProducts: [parseInt(metadata.product_id)],
      payment_processor: processor,
      payment_id: paymentId,
      end_date: `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
    });
  }
}

const completed = async (triggerObj) => {
  const { event, type, status } = triggerObj;
  console.log(type, event, status);
  console.log(triggerObj);

}


const trigger = async (req, res) => {
  res.send('OK');
  const triggerObj = req.body;
  switch (triggerObj.event) {
    case ('completed'):
      await completed(triggerObj);
      return;
    case ('created'):
      await create(triggerObj);
      return;
    case ('updated'):
    case ('deleted'):
      await update(triggerObj);
      return;
    default:
      const { event, type, status } = triggerObj;
      console.log('UnCaught Event: ');
      console.log(type, event, status);
      return;

  }

}

module.exports = { trigger };