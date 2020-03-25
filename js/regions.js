function sortDataSet(dataSet, userPreferences) {
  let {type} = getTypeAndView(SETTINGS, userPreferences);

  return dataSet.sort((a, b) => {
    let valueA = calculateValue(a.dates, a.dates.length - 1, type, getView(SETTINGS, "total"));
    let valueB = calculateValue(b.dates, b.dates.length - 1, type, getView(SETTINGS, "total"));
    if (isNaN(valueA) && !isNaN(valueB)) {
      return 1;
    }
    return valueB - valueA;
  });
}
