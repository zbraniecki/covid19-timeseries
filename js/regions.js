function sortDataSet(dataSet, userPreferences) {
  let {type} = getTypeAndView(SETTINGS, userPreferences);
  let result = [];

  for (let regionName in dataSet) {
    result.push({
      "name": regionName,
      "dates": dataSet[regionName]
    });
  }

  return result.sort((a, b) => {
    let valueA = calculateValue(a.dates, a.dates.length - 1, type, getView(SETTINGS, "total"));
    let valueB = calculateValue(b.dates, b.dates.length - 1, type, getView(SETTINGS, "total"));
    return valueB - valueA;
  });
}
