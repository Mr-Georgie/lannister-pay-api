/**
 * Step 1: group transactionobject by type
 * Step 2: compute the transaction starting from FLAT to PERCENTAGE to RATIO
 * Step 3: compile all computations into one object
 */

// Step1
const getFlatTypes = (transObj) => {
  let flatTypes = transObj.SplitInfo.filter((obj) => obj.SplitType === "FLAT");

  return { ...transObj, SplitInfo: flatTypes };
};

const getPercentTypes = (transObj) => {
  let flatTypes = transObj.SplitInfo.filter(
    (obj) => obj.SplitType === "PERCENTAGE"
  );

  return { ...transObj, SplitInfo: flatTypes };
};

const getRatioTypes = (transObj) => {
  let flatTypes = transObj.SplitInfo.filter((obj) => obj.SplitType === "RATIO");

  return { ...transObj, SplitInfo: flatTypes };
};

const getTotalRatio = (ratioTypeObj) => {
  let total = 0;

  ratioTypeObj.SplitInfo.forEach((element) => {
    total += element.SplitValue;
  });

  return total;
};

// Step 2
exports.computeTransaction = (transObj) => {
  // get the filtered transaction objects by their type
  const transObjWithFlatTypes = getFlatTypes(transObj);
  const transObjWithPercentTypes = getPercentTypes(transObj);
  const transObjWithRatioTypes = getRatioTypes(transObj);

  // get total ratio from transaction objects with ratio types
  const sumTotalRatio = getTotalRatio(transObjWithRatioTypes);

  // Get opening balance from original transaction object
  let balance = transObj.Amount;

  // The will be used to splitbreakdowns after computation by types
  const allSplitBreakdowns = [];

  // computation for flat types
  transObjWithFlatTypes.SplitInfo.forEach((element) => {
    let splitBreakdown = {}; // will hold individual split breakdown
    balance -= element.SplitValue;
    splitBreakdown.SplitEntityId = element.SplitEntityId;
    splitBreakdown.Amount = element.SplitValue;
    // save individual split breakdown to all split breakdowns
    allSplitBreakdowns.push(splitBreakdown);
  });

  // computation for percent types
  transObjWithPercentTypes.SplitInfo.forEach((element) => {
    let splitBreakdown = {}; // will hold individual split breakdown
    let percent = element.SplitValue / 100;
    splitAmount = balance * percent;
    balance -= splitAmount;
    splitBreakdown.SplitEntityId = element.SplitEntityId;
    splitBreakdown.Amount = splitAmount;
    // save individual split breakdown to all split breakdowns
    allSplitBreakdowns.push(splitBreakdown);
  });

  // opening ratio balance which will be used to find the split amounts for all ratio
  const openingRatioBalance = balance;

  // computation for ratio types
  transObjWithRatioTypes.SplitInfo.forEach((element) => {
    let splitBreakdown = {}; // will hold individual split breakdown
    let splitAmount =
      (element.SplitValue / sumTotalRatio) * openingRatioBalance;
    balance -= splitAmount;
    splitBreakdown.SplitEntityId = element.SplitEntityId;
    splitBreakdown.Amount = splitAmount;
    // save individual split breakdown to all split breakdowns
    allSplitBreakdowns.push(splitBreakdown);
  });

  // compiling computations into computed object
  const computedObj = {};
  computedObj.ID = transObjWithFlatTypes.ID;
  computedObj.Balance = balance;
  computedObj.SplitBreakdown = allSplitBreakdowns;

  return { computedObj };
};
