// This is your test secret API key.
const stripe = require('stripe')(process.env.STRIPE_TOKEN);
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const YOUR_DOMAIN = 'http://localhost:8082';

const backendApi = axios.create({
    baseURL: 'http://poc-entitlements-backend-1:8080',
    timeout: 1000
});

const paymentApi = axios.create({
    baseURL: 'https://api.stripe.com/v1',
    headers: {
        'Authorization': `Bearer ${process.env.STRIPE_TOKEN}`
    },
    timeout: 1000
});


async function postToEntitlements(postObj) {
    return await backendApi.post('/webhooks', postObj)
        .then((response) => {
            return response;
        })
        .catch(function (error) {
            return error;
        });
}

const calculateOrderAmount = (items) => {
    return 999;
};

const getRecovery = async (req, res) => {
    let str = '';
    const stripeParams = new URLSearchParams({
        // created: 1685951921,
        delivery_success: true,
        limit: 2
    })

    await paymentApi.get(`/events?${stripeParams}`)
        .then(async r => {
            const reader = r.body.getReader();
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                str += String.fromCharCode.apply(null, value);
            }
        })
    res.send(str);
};


const createIntent = async (req, res) => {
    const { items } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
        amount: calculateOrderAmount(items),
        currency: "usd",
        automatic_payment_methods: {
            enabled: true,
        },
    });

    res.send({ clientSecret: paymentIntent.client_secret });
};

const checkoutSession = async (req, res) => {
    const prices = await stripe.prices.list({
        product: req.body.product,
        expand: ['data.product'],
    });
    // This will be replaced with an existing UUID from Identity.
    const unique_identifier = uuidv4();

    const session = await stripe.checkout.sessions.create({
        billing_address_collection: 'auto',
        line_items: [
            {
                price: prices.data[0].id,
                quantity: 1,

            },
        ],
        subscription_data: {
            metadata: {
                unique_identifier,
                product_id: req.body.id
            }
        },

        client_reference_id: unique_identifier,
        mode: 'subscription',
        success_url: `${YOUR_DOMAIN}/success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${YOUR_DOMAIN}/cancel.html`,
    });

    res.redirect(303, session.url);
};

const portalSession = async (req, res) => {
    const { session_id } = req.body;
    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
    const returnUrl = YOUR_DOMAIN;

    const portalSession = await stripe.billingPortal.sessions.create({
        customer: checkoutSession.customer,
        return_url: returnUrl,
    });

    res.redirect(303, portalSession.url);
};

const webhook = async (request, response) => {
    let event = request.body;
    if (process.env.STRIPE_ENDPOINT_SECRET) {
        const signature = request.headers['stripe-signature'];
        try {
            event = stripe.webhooks.constructEvent(
                request.body,
                signature,
                process.env.STRIPE_ENDPOINT_SECRET
            );
        } catch (err) {
            console.log(`webhook signature verification failed.`, err.message);
            return response.sendStatus(400);
        }
    }
    response.send();

    const subscription = event.data.object;
    const { status, customer, plan, metadata, client_reference_id } = subscription;
    const eventTypes = event.type.split('.');
    await postToEntitlements({
        processor: process.env.PAYMENT_PROCESSOR,
        event: eventTypes.pop(),
        type: eventTypes.pop(),
        paymentId: customer,
        unique_identifier: client_reference_id || null,
        status: status,
        product: (plan && plan.product) ? plan.product : null,
        metadata: metadata || null,
    })
        .then((response) => {
            // console.log(response.data);
        })
        .catch((err) => {
            throw err;
        });


};

module.exports = { getRecovery, createIntent, checkoutSession, portalSession, webhook };