const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const stripe = require("stripe")(
  "sk_test_51JQQBpHICmjXD3ya3Gd3N2bMFdvx0xD12gEtOJmYLq4t1Y1MtjrXUW2Pk8PHkB3balftTFQeR4SpkSqiBhwJ8GVc00EP1rupbp"
);

var app = express();
var bodyParser = require("body-parser");
// view engine setup (Handlebars)
app.engine(
  "hbs",
  exphbs({
    defaultLayout: "main",
    extname: ".hbs",
  })
);
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
/**
 * Home route
 */
app.get("/", function (req, res) {
  res.render("index");
});

/**
 * Replicates a database query for book details
 */
const getBookDetails = (item) => {
  let title, amount, error;
  switch (item) {
    case "1":
      title = "The Art of Doing Science and Engineering";
      amount = 2300;
      break;
    case "2":
      title = "The Making of Prince of Persia: Journals 1985-1993";
      amount = 2500;
      break;
    case "3":
      title = "Working in Public: The Making and Maintenance of Open Source";
      amount = 2800;
      break;
    default:
      error =
        "Unable to find book for purchase. Try going back to the main page.";
      break;
  }
  return { item, amount, error };
};

/**
 * Checkout route
 */
app.get("/checkout", function (req, res) {
  const item = req.query.item;
  res.render("checkout", getBookDetails(item));
});

/**
 * Payment Intent
 */
app.post("/create-payment-intent", async (req, res) => {
  const { item } = req.body;
  const bookDetails = getBookDetails(item);

  if (bookDetails.error) {
    // Error occurred when finding book details.
    // Skip creating a payment intent
    res.send({
      error: bookDetails.error,
    });
  } else {
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: bookDetails.amount,
      currency: "usd",
    });
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  }
});

/**
 * Start server
 */
app.listen(3000, () => {
  console.log("Getting served on port 3000");
});
