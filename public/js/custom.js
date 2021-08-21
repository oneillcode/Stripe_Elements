/**
 * Clientside helper functions
 */
var stripe = Stripe(
  "pk_test_51JQQBpHICmjXD3ya501T4LYbTfvBpm1O1F6XpM0tBKbZKv1eDSjMeLNW8HhLBR70wQCa6NIU37vQBw4BoVXTWS5t00opGLkEcA"
);

$(document).ready(function () {
  var amounts = document.getElementsByClassName("amount");
  // iterate through all "amount" elements and convert from cents to dollars
  for (var i = 0; i < amounts.length; i++) {
    amount = amounts[i].getAttribute("data-amount") / 100;
    amounts[i].innerHTML = amount.toFixed(2);
  }
});

// Get item Id from URL
// Return item Id
const getPurchaseItem = () => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());

  let item = params.item ? { item: params.item } : {};
  return item;
};

$(document).ready(function () {
  //Determine if page is on Checkout to start Payemnt Intent fetch
  if ($("#checkout-container").length > 0) {
    var submitButton = document.querySelector("#submit");

    //Disable submit button if no info entered
    if (submitButton) {
      submitButton.disabled = true;
    }

    //Start creation of payment intent
    fetch("/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(getPurchaseItem()),
    })
      .then(function (result) {
        return result.json();
      })
      .then(function (data) {
        var elements = stripe.elements();
        var style = {
          base: {
            color: "#32325d",
            fontFamily: "Arial, sans-serif",
            fontSmoothing: "antialiased",
            fontSize: "16px",
            "::placeholder": {
              color: "#32325d",
            },
          },
          invalid: {
            fontFamily: "Arial, sans-serif",
            color: "#fa755a",
            iconColor: "#fa755a",
          },
        };

        var card = elements.create("card", { style: style });
        // Stripe injects an iframe into the DOM
        card.mount("#card-element");
        card.on("change", function (event) {
          // Disable the Pay button if there are no card details in the Element
          document.querySelector("#submit").disabled = event.empty;
          document.querySelector("#card-error").textContent = event.error
            ? event.error.message
            : "";
        });

        var form = document.getElementById("payment-form");
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          // Complete payment when the submit button is clicked
          payWithCard(stripe, card, data.clientSecret);
        });
      });
  }
});

// Calls stripe.confirmCardPayment
// If the card requires authentication Stripe shows a pop-up modal to
// prompt the user to enter authentication details without leaving your page.
var payWithCard = function (stripe, card, clientSecret) {
  loading(true);
  stripe
    .confirmCardPayment(clientSecret, {
      receipt_email: document.getElementById("email").value,
      payment_method: {
        card: card,
      },
    })
    .then(function (result) {
      if (result.error) {
        // Show error to your customer
        showError(result.error.message);
      } else {
        // The payment succeeded!
        orderComplete(result.paymentIntent.id, result.paymentIntent.amount);
      }
    });
};

/* ------- UI helpers ------- */

// Show the customer the error from Stripe if their card fails to charge
var showError = function (errorMsgText) {
  loading(false);
  var errorMsg = document.querySelector("#card-error");
  errorMsg.textContent = errorMsgText;
  setTimeout(function () {
    errorMsg.textContent = "";
  }, 4000);
};

// Shows a success message when the payment is complete
var orderComplete = (payment_id, price) => {
  document.getElementById("payment-form").style.display = "none";
  document.getElementById("card-receipt").style.display = "block";

  var receipt = document.getElementById("payment-intent-id");
  receipt.innerHTML = `Payment Intent ID: <b>${payment_id}</b>`;

  var receipt = document.getElementById("payment-price");
  receipt.innerHTML = `Final Price: <b>$${(price / 100).toFixed(2)}</b>`;
};

// Show a spinner on payment submission
var loading = function (isLoading) {
  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("button").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("button").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
};
