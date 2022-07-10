exports.checkFinalBalance = (result) => {
  const error = {}; // will hold error message if any

  if (result.Balance < 0) {
    error.message = `Oops! Final balance is less than 0. Got ${result.Balance}`;
  }

  return { error };
};
