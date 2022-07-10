// ./src/index.js
// importing the dependencies
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");

// specify the port or get it from environment variables
const PORT = process.env.PORT || 5000;

// defining the Express app
const app = express();

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan("combined"));

const { validateTransaction } = require("./helpers/validateTransaction");
const { checkFinalBalance } = require("./helpers/checkFinalBalance");
const { checkSplitAmount } = require("./helpers/checkSplitAmount");
const { computeTransaction } = require("./helpers/computeTransactions");

// defining an endpoint to return all ads
app.get("/", (req, res) => {
  res.send(
    "Hi there! To use this service, please send a post request to '/split-payments/compute' with a transaction object as body"
  );
});

//CREATE Request Handler
app.post("/split-payments/compute", (req, res) => {
  // first constraint check
  const { error: userInputError } = validateTransaction(req.body);

  // console.log("error? ", userInputError);

  if (userInputError.message) {
    res.status(400).send(userInputError.message);
    return;
  }

  const { computedObj } = computeTransaction(req.body);

  // 3rd, 4th and 5th constraint check
  const { error: splitAmountError } = checkSplitAmount(
    req.body,
    computedObj.SplitBreakdown
  );

  // console.log("error? ", splitAmountError);

  if (splitAmountError.message) {
    res.status(400).send(splitAmountError.message);
    return;
  }

  // second constraint check
  const { error: finalBalanceError } = checkFinalBalance(computedObj);

  // console.log("error? ", finalBalanceError);

  if (finalBalanceError.message) {
    res.status(400).send(finalBalanceError.message);
    return;
  }

  res.status(200).send(computedObj);
});

// starting the server
app.listen(PORT, (error) => {
  if (error) {
    return console.log("Something bad happened", error);
  }
  console.log(`Listening on port ${PORT}`);
});
