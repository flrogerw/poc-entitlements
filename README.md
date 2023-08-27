
# Proof of Concept for the Entitlement Service

The architecture team's approach prioritized the relationship between a user (Subscriber) and their Entitlements, rather than linking the Subscriber to a specific Product*. Our focus was on separating the Subscriber from Product associations and a Product from it’s billable counter part within the third-party payment system.  This strategy allows us to manage Subscriber Entitlements at three levels: individual Subscriber, Entitlement layer, and Product. Our architecture is scalable, CCPA and PII compliant, and adaptable for future iterations. The entire architecture team and relevant team leads collaborated on this project, optimizing data schemas and database queries for performance and cost efficiency as well as relevant input on how they see their systems interacting with the new service. A functional Proof of Concept (POC) and API schemas/contracts are available for download, facilitating teamwork.  While surpassing initial MVP requirements, our proposed architecture's additional features stem from robust data management. These extras can be implemented from day one or gradually introduced later.

*There is a coupling between Product in Subscriber but only for display and reporting purposes.  The Entitlement granting workflow has no concept of Products. 



## Running the POC

### Requirements
The only requirement is the node Stripe module.

~~~
npm install stripe -g
~~~

### Start the Containers
1. Create a .env file within the stripe_adapter folder using the included sample for direction.

2. Build the containers

~~~
docker-compose up --detach
~~~

3. Run the Database Migrations

~~~
npm run migrations
~~~

4. Run the Database Seed files.

~~~
npm run seeds
~~~
or this for MVP
~~~
npm run seeds-mvp
~~~

5. Forward Payment Processors Events to localhost.

~~~
stripe listen --forward-to localhost:8082/webhook
~~~

6. Test your webhook listener.

~~~
stripe trigger payment_intent.succeeded
~~~

7. Avaiable URLs:

    This is a sample Audacy subscription page that is tied into the backend as well as the payment processor(Stripe)

    Sample Audacy Subscription Page - http://localhost:8082/subscriptions-all.html

    These two links will take you to the Admin Panel(s) GUI.

    Entitlements Admin MVP - http://localhost:5174

    Entitlements Admin Future Proofed - http://localhost:5173

    Audacy Entitlement API Contracts.

    API Documentation - http://localhost:8080/api-doc
