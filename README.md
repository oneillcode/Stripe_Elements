# Stripe Elements Project

Example execution of the Stripe API. 

## Setup

Install the necessary packages

```bash
npm install
```

Start local server on port 3000
```bash
npm start
```

Navigate to `localhost:3000`

## Explanation

In this project, we use the [Stripe JavaScript SDK](https://stripe.com/docs/js) on the frontend and [Node.Js](https://nodejs.org/en/) / [Express](https://expressjs.com/) on the 
backend to facilitate the purchase of books. The following diagram outlines how all systems 
work together to create a payment (Each step briefly described below):

![Stripe Workflow](/workflow.png)

***Step 0: User Navigation***

When a user lands on the main website URL they will be presented with multiple books that they 
can navigate and purchase. If a user clicks the purchase button on a specific book, they will be 
navigated to the /checkout route where the checkout process can begin. 

***Step 1: Frontend initializes Payment Intent***

When a user loads the checkout page, an HTTP Post request is sent to the backend with an item 
id. The item id represents the book for purchase and is parsed from the URL query string. For 
example, if the selected book has an item id of 1 the query string would /checkout?item=1.
This allows the backend to look-up the price of a book in the database (fake database in this 
project) instead of the price being sent from the frontend. This protects against malicious users 
manipulating the prize in the request to the backend.

***Step 2: Create Payment Intent***

The backend utilizes the [Stripe Payment Intent API](https://stripe.com/docs/payments/payment-intents) to create a payment intent. A Payment Intent 
encapsulates details about the transaction, such as the supported payment methods, the amount to 
collect, and the desired currency.

***Step 3: Stripe API responds***

Stripe creates an incomplete payment in their system and responds with specific details including 
the client secret key. The client secret key is a unique key for each payment and is used to 
invoke functions to complete payments.

***Step 4: Backend passes client secret***

Backend sends the client secret key to the frontend. 

***Step 5: User submits payment information***

At this point, the user can enter their payment information into the UI. On the frontend, [Stripe 
Card Elements](https://stripe.com/docs/stripe-js) are used to capture credit card details and confirm the correct card format. From a 
coding perspective, all it takes is adding specific HTML / CSS code that the Stripe JavaScript 
SDK will detect and inject the needed functionality. 

When user clicks the payment button to finalize purchase, the [confirmPayment](https://stripe.com/docs/js/deprecated/confirm_payment_intent) function from the 
Stripe JavaScript SDK is used to send the client secret key along with payment information.

***Step 6: Success or Error***

Stripe will check the client secret key, confirm payment info, and complete the payment if 
possible. It will respond with a success or error response that can be used on the front end to 
update the user. In this project, if successful, the user will be shown their Stripe Payment Intent 
ID and the final price.

Stripe responds with both these data points in the success response and can be easily retrieved
along with various other purchase info



## License
[MIT](https://choosealicense.com/licenses/mit/)