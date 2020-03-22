function sortDataSet(dataSet, userPreferences) {
  let type = getType(TYPES, userPreferences.selectedType);
  let result = [];

  for (let regionName in dataSet) {
    result.push({
      "name": regionName,
      "days": dataSet[regionName]
    });
  }

  return result.sort((a, b) => {
    let valueA = calculateValue(a.days, a.days.length - 1, type.id);
    let valueB = calculateValue(b.days, b.days.length - 1, type.id);
    return valueB - valueA;
  });
}
