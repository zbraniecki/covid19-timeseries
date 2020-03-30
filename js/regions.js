function sortDataSet(dataSet, userPreferences) {
  let {types} = getTypesAndView(SETTINGS, userPreferences);

  return dataSet.sort((a, b) => {
    let valueA = calculateLatestValue(a, a.latest, types, getView(SETTINGS, "total"));
    let valueB = calculateLatestValue(b, b.latest, types, getView(SETTINGS, "total"));
    if (isNaN(valueA) && !isNaN(valueB)) {
      return 1;
    }
    return valueB - valueA;
  });
}
