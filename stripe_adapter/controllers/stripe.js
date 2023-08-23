// This is your test secret API key.
const stripe = require('stripe')(process.env.STRIPE_TOKEN);
const axios = require('axios');

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


async function postToWebhooks(postObj) {
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

    const audacyId = `audacy_id-${Math.random() * 1000}`

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
                audacy_id: audacyId,
                audacy_product_id: 'sub_001'
            }
        },

        client_reference_id: audacyId,
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
        const endpointSecret = "whsec_7ac93e622ed6842644a9bdad7fb8754cafe0dfafa88437c5b40f240dedecd03d";
        if (endpointSecret) {
            const signature = request.headers['stripe-signature'];
            try {
                event = stripe.webhooks.constructEvent(
                    request.body,
                    signature,
                    endpointSecret
                );
            } catch (err) {
                console.log(`webhook signature verification failed.`, err.message);
                return response.sendStatus(400);
            }
        }

        const subscription = event.data.object;
        const { status, customer, plan, metadata, client_reference_id } = subscription;
        const postObj = { paymentProcessor: 'Stripe' };

        switch (event.type) {
            case 'customer.subscription.trial_will_end':
            case 'customer.subscription.deleted':
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'checkout.session.completed':
                postObj.event = event.type.substring(event.type.lastIndexOf('.') + 1);
                postObj.paymentId = customer;
                postObj.unique_identifier = client_reference_id || null;
                postObj.status = status;
                postObj.product = (plan && plan.product) ? plan.product : null;
                postObj.metadata = metadata || null;
                break;
            default:

                console.log(`${event.type} is irrelevent to our systems.\n`);
        }
        response.send();
        if (postObj.paymentId) {
            await postToWebhooks(postObj)
                .then((response) => {
                    console.log(response.data);
                })
                .catch((err) => {
                    throw err;
                });
        }

    };

module.exports = { getRecovery, createIntent, checkoutSession, portalSession, webhook };