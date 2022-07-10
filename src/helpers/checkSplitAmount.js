exports.checkSplitAmount = (transObj, SplitBreakdown) => {
  let sumSplitAmount = 0;

  SplitBreakdown.forEach((element) => {
    sumSplitAmount += element.Amount;
  });
  const error = {};

  const checkOne = SplitBreakdown.every((element, index) => {
    // check whether element passes condition
    // if passed return true, if fails return false
    return element.Amount < transObj.Amount;
  });

  if (!checkOne) {
    error.message =
      "Oops! There is a computational error. Split amount is greater than transaction amount. Check console";
    return { error };
  }

  const checkTwo = SplitBreakdown.every((element, index) => {
    // check whether element passes condition
    // if passed return true, if fails return false
    return element.Amount >= 0;
  });

  if (!checkTwo) {
    error.message =
      "Oops! There is a computational error. Split amount is less than 0. Check console";
    return { error };
  }

  const checkThree = () => sumSplitAmount > transObj.Amount;

  if (checkThree()) {
    error.message =
      "Oops! There is a computational error. Sum of Split amount is greater than transaction amount. Check console";
    return { error };
  }

  return { error };
};
