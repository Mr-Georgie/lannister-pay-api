exports.checkFinalBalance = (result) => {
  const error = {};

  if (result.Balance < 0) {
    error.message =
      "Oops! There is a computational error. Final balance is less than 0";
  }

  return { error };
};
