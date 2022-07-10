exports.checkSplitAmount = (transObj, SplitBreakdown) => {
  let sumSplitAmount = 0; // will hold the sum of split amount from computed objected

  // this will sum all split amount
  for (let index = 0; index < SplitBreakdown.length; ++index) {
    sumSplitAmount += SplitBreakdown[index].Amount;
  }

  // this will hold error message that will be returned if any
  const error = {};

  // Check 1: If split amount is greater than transaction amount
  const checkOne = SplitBreakdown.every((element) => {
    // will return true or false based on condition
    return element.Amount < transObj.Amount;
  });

  if (!checkOne) {
    error.message = "Oops! Split amount is greater than transaction amount.";
    return { error };
  }

  // Check 2: If split amount is less than 0
  const checkTwo = SplitBreakdown.every((element) => {
    // will return true or false based on condition
    return element.Amount >= 0;
  });

  if (!checkTwo) {
    error.message = "Oops! Split amount is less than 0.";
    return { error };
  }

  // Check 3: If sum of Split amount is greater than transaction amount
  const checkThree = () => sumSplitAmount > transObj.Amount;

  if (checkThree()) {
    error.message =
      "Oops! Sum of Split amount is greater than transaction amount.";
    return { error };
  }

  return { error };
};
