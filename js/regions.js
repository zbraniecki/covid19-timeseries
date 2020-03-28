function sortDataSet(dataSet, userPreferences) {
  let {type} = getTypeAndView(SETTINGS, userPreferences);

  return dataSet.sort((a, b) => {
    let valueA = calculateLatestValue(a.dates, a.latest, type, getView(SETTINGS, "total"));
    let valueB = calculateLatestValue(b.dates, b.latest, type, getView(SETTINGS, "total"));
    if (isNaN(valueA) && !isNaN(valueB)) {
      return 1;
    }
    return valueB - valueA;
  });
}
