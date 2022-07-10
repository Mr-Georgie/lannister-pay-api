/**
 * Step 1: group transactionobject by type
 * Step 2: compute the transaction starting from FLAT to PERCENTAGE to RATIO
 * Step 3: compile all computations into one object
 */

// Step1
const groupSplitTypes = (transObj) => {
  let flatTypes = [];
  let percentTypes = [];
  let ratioTypes = [];

  for (let index = 0; index < transObj.SplitInfo.length; ++index) {
    if (transObj.SplitInfo[index].SplitType === "FLAT") {
      flatTypes.push(transObj.SplitInfo[index]);
    } else if (transObj.SplitInfo[index].SplitType === "PERCENTAGE") {
      percentTypes.push(transObj.SplitInfo[index]);
    } else {
      ratioTypes.push(transObj.SplitInfo[index]);
    }
  }

  const transObjWithFlatTypes = { ...transObj, SplitInfo: flatTypes };
  const transObjWithPercentTypes = { ...transObj, SplitInfo: percentTypes };
  const transObjWithRatioTypes = { ...transObj, SplitInfo: ratioTypes };

  return {
    transObjWithFlatTypes,
    transObjWithPercentTypes,
    transObjWithRatioTypes,
  };
};

const getTotalRatio = (ratioTypeObj) => {
  let total = 0;

  ratioTypeObj.SplitInfo.forEach((element) => {
    total += element.SplitValue;
  });

  // for (let index = 0; index < ratioTypeObj.SplitInfo.length; ++index) {
  //   total += ratioTypeObj.SplitInfo[index].SplitValue;
  // }

  return total;
};

// Step 2
exports.computeTransaction = (transObj) => {
  // get the filtered transaction objects by their type
  const {
    transObjWithFlatTypes,
    transObjWithPercentTypes,
    transObjWithRatioTypes,
  } = groupSplitTypes(transObj);

  // get total ratio from transaction objects with ratio types
  const sumTotalRatio = getTotalRatio(transObjWithRatioTypes);

  // Get opening balance from original transaction object
  let balance = transObj.Amount;

  // The will be used to splitbreakdowns after computation by types
  const allSplitBreakdowns = [];

  // computation for flat types
  for (let index = 0; index < transObjWithFlatTypes.SplitInfo.length; ++index) {
    let splitBreakdown = {}; // will hold individual split breakdown
    balance -= transObjWithFlatTypes.SplitInfo[index].SplitValue;
    splitBreakdown.SplitEntityId =
      transObjWithFlatTypes.SplitInfo[index].SplitEntityId;
    splitBreakdown.Amount = transObjWithFlatTypes.SplitInfo[index].SplitValue;
    // save individual split breakdown to all split breakdowns
    allSplitBreakdowns.push(splitBreakdown);
  }

  // computation for percent types
  for (
    let index = 0;
    index < transObjWithPercentTypes.SplitInfo.length;
    ++index
  ) {
    let splitBreakdown = {}; // will hold individual split breakdown
    let percent = transObjWithPercentTypes.SplitInfo[index].SplitValue / 100;
    splitAmount = balance * percent;
    balance -= splitAmount;
    splitBreakdown.SplitEntityId =
      transObjWithPercentTypes.SplitInfo[index].SplitEntityId;
    splitBreakdown.Amount = splitAmount;
    // save individual split breakdown to all split breakdowns
    allSplitBreakdowns.push(splitBreakdown);
  }

  // opening ratio balance which will be used to find the split amounts for all ratio
  const openingRatioBalance = balance;

  // computation for ratio types
  for (
    let index = 0;
    index < transObjWithRatioTypes.SplitInfo.length;
    ++index
  ) {
    let splitBreakdown = {}; // will hold individual split breakdown
    let splitAmount =
      (transObjWithRatioTypes.SplitInfo[index].SplitValue / sumTotalRatio) *
      openingRatioBalance;
    balance -= splitAmount;
    splitBreakdown.SplitEntityId =
      transObjWithRatioTypes.SplitInfo[index].SplitEntityId;
    splitBreakdown.Amount = splitAmount;
    // save individual split breakdown to all split breakdowns
    allSplitBreakdowns.push(splitBreakdown);
  }

  // compiling computations into computed object
  const computedObj = {};
  computedObj.ID = transObjWithFlatTypes.ID;
  computedObj.Balance = balance;
  computedObj.SplitBreakdown = allSplitBreakdowns;

  return { computedObj };
};
