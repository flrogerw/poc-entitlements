
# Proof of Concept for the Entitlement Service

The architecture team's approach prioritized the relationship between a user (Subscriber) and their Entitlements, rather than linking the Subscriber to a specific Product*. Our focus was on separating the Subscriber from Product associations and a Product from it’s billable counter part within the third-party payment system.  This strategy allows us to manage Subscriber Entitlements at three levels: individual Subscriber, Entitlement layer, and Product. Our architecture is scalable, CCPA and PII compliant, and adaptable for future iterations. The entire architecture team and relevant team leads collaborated on this project, optimizing data schemas and database queries for performance and cost efficiency as well as relevant input on how they see their systems interacting with the new service. A functional Proof of Concept (POC) and API schemas/contracts are available for download, facilitating teamwork.  While surpassing initial MVP requirements, our proposed architecture's additional features stem from robust data management. These extras can be implemented from day one or gradually introduced later.

*There is a coupling between Product in Subscriber but only for display and reporting purposes.  The Entitlement granting workflow has no concept of Products. 



## Running the POC

### Global Requirements

~~~
npm install stripe -g
~~~

### Start the Containers
1. Rename the env_sample file within the stripe_adapter folder to .env. 

2. Open the .env file and populate with the correct values as indicated within the file. **You will need a Stripe Account and some configuration done within Stripe.**

    *The second step is not necesary if you do not plan on creating external Products nor Create new Subscribers by purchasing a Product.*

### Build the containers

~~~
cd poc-entitlements
docker-compose up --detach
~~~

### Setup the Database and Run the Migrations

~~~
cd backend
npm install knex
npm install pg
npm run setup
npm run migrations
~~~

### Run the Database Seed files.

For MVP

~~~
npm run seeds-mvp
~~~

For Future Proof

~~~
npm run seeds
~~~

### Forward Payment Processors Events to localhost.

1. Forward the Stripe account events to your local machine.

~~~
stripe listen --forward-to localhost:8082/webhook
~~~

2. Test your webhook listener.

Once the forward is in place you can test by running the following command.  You should see the events scroll by in your terminal window.

~~~
stripe trigger payment_intent.succeeded
~~~

### Avaiable URLs:

A sample Audacy subscription page that is tied into the backend as well as the payment processor(Stripe)

~~~
http://localhost:8082/subscriptions-all.html
~~~

MVP for the Admin panel.  Striped down to just Subscribers and a single Product and Entitlement.

~~~
http://localhost:5174
~~~

Down the road version of the Admin Panel with all the bells and whistles enabled.

~~~
http://localhost:5173
~~~

Here you will find the Swagger docs as well as being able to test the API calls against the server..

~~~
http://localhost:8080/api-doc
~~~