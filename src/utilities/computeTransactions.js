/**
 * Step 1: group transaction object by type
 * Step 2: compute the transaction starting from FLAT to PERCENTAGE to RATIO
 * Step 3: compile all computations into one object
 */

// Step1
const groupSplitTypes = (transObj) => {
  let flatTypes = [];
  let percentTypes = [];
  let ratioTypes = [];

  const lengthOfSplitInfo = transObj.SplitInfo.length;

  for (let index = 0; index < lengthOfSplitInfo; ++index) {
    if (transObj.SplitInfo[index].SplitType === "FLAT") {
      flatTypes.push(transObj.SplitInfo[index]);
    } else if (transObj.SplitInfo[index].SplitType === "PERCENTAGE") {
      percentTypes.push(transObj.SplitInfo[index]);
    } else {
      ratioTypes.push(transObj.SplitInfo[index]);
    }
  }

  return {
    flatTypes,
    percentTypes,
    ratioTypes,
  };
};

const getTotalRatio = (splitInfo) => {
  let total = 0;

  splitInfo.forEach((element) => {
    total += element.SplitValue;
  });

  return total;
};

// Step 2
exports.computeTransaction = (transObj) => {
  // get the filtered transaction objects by their type
  const { flatTypes, percentTypes, ratioTypes } = groupSplitTypes(transObj);

  // get total ratio from transaction objects with ratio types
  const sumTotalRatio = getTotalRatio(ratioTypes);

  // Get opening balance from original transaction object
  let balance = transObj.Amount;

  // The will be used to splitbreakdowns after computation by types
  const allSplitBreakdowns = [];

  // computation for flat types
  for (let index = 0; index < flatTypes.length; ++index) {
    let splitBreakdown = {}; // will hold individual split breakdown
    balance -= flatTypes[index].SplitValue;
    splitBreakdown.SplitEntityId = flatTypes[index].SplitEntityId;
    splitBreakdown.Amount = flatTypes[index].SplitValue;
    // save individual split breakdown to all split breakdowns
    allSplitBreakdowns.push(splitBreakdown);
  }

  // computation for percent types
  for (let index = 0; index < percentTypes.length; ++index) {
    let splitBreakdown = {}; // will hold individual split breakdown
    let percent = percentTypes[index].SplitValue / 100;
    splitAmount = balance * percent;
    balance -= splitAmount;
    splitBreakdown.SplitEntityId = percentTypes[index].SplitEntityId;
    splitBreakdown.Amount = splitAmount;
    // save individual split breakdown to all split breakdowns
    allSplitBreakdowns.push(splitBreakdown);
  }

  // opening ratio balance which will be used to find the split amounts for all ratio
  const openingRatioBalance = balance;

  // computation for ratio types
  for (let index = 0; index < ratioTypes.length; ++index) {
    let splitBreakdown = {}; // will hold individual split breakdown
    let splitAmount =
      (ratioTypes[index].SplitValue / sumTotalRatio) * openingRatioBalance;
    balance -= splitAmount;
    splitBreakdown.SplitEntityId = ratioTypes[index].SplitEntityId;
    splitBreakdown.Amount = splitAmount;
    // save individual split breakdown to all split breakdowns
    allSplitBreakdowns.push(splitBreakdown);
  }

  // Step 3: compiling computations into computed object
  const computedObj = {};
  computedObj.ID = transObj.ID;
  computedObj.Balance = balance;
  computedObj.SplitBreakdown = allSplitBreakdowns;

  return { computedObj };
};
