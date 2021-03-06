// ./src/index.js
// importing the dependencies
const express = require("express");
const bodyParser = require("body-parser");

// specify the port or get it from environment variables
const PORT = process.env.PORT || 5000;

// defining the Express app
const app = express();

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

const { validateTransaction } = require("./utilities/validateTransaction");
const { checkFinalBalance } = require("./utilities/checkFinalBalance");
const { checkSplitAmount } = require("./utilities/checkSplitAmount");
const { computeTransaction } = require("./utilities/computeTransactions");

// defining an endpoint to return all ads
app.get("/", (req, res) => {
  res.send(
    "Hi there! To use this service, please send a post request to '/split-payments/compute' with a transaction object as body"
  );
});

//CREATE Request Handler
app.post("/split-payments/compute", (req, res) => {
  // first constraint check if there is at least 1 entity in split info array
  const { error: userInputError } = validateTransaction(req.body);

  if (userInputError.message) {
    res.status(400).send(userInputError.message);
    return;
  }

  const { computedObj } = computeTransaction(req.body); // get the computed object

  // check if split amount is:
  // greater than transaction amount
  // lesser than 0
  // sum of split amount is greater than transaction amount
  const { error: splitAmountError } = checkSplitAmount(
    req.body,
    computedObj.SplitBreakdown
  );

  if (splitAmountError.message) {
    res.status(400).send(splitAmountError.message);
    return;
  }

  // check if final balance is less than zero
  const { error: finalBalanceError } = checkFinalBalance(computedObj);

  if (finalBalanceError.message) {
    res.status(400).send(finalBalanceError.message);
    return;
  }

  // if all check is passed without error, respond with computed object
  res.status(200).send(computedObj);
});

// starting the server
app.listen(PORT, (error) => {
  if (error) {
    return console.log("Something bad happened", error);
  }
  console.log(`Listening on port ${PORT}`);
});
