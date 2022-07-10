exports.validateTransaction = (transObj) => {
  const error = {};

  //   SplitInfo array should have at least 1 entity
  if (transObj.SplitInfo.length === 0) {
    error.message = "Please provide at least 1 split entity in SplitInfo array";
  }

  //   SplitInfo array entities should not be more than 20
  if (transObj.SplitInfo.length > 20) {
    error.message =
      "Please reduce the number of entities in SplitInfo array. We can only compute up to 20 split entities at a time.";
  }

  return { error };
};
