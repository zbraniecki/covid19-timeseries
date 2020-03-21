function getCurrentValuesForRegion(data, type) {
  let result = [];

  for (let regionName in data) {
    let region = data[regionName];
    let last = region[region.length - 1][type];
    result.push({
      region: regionName,
      value: last,
    });
  }

  return result;
}

function getSortedRegions(data, type) {
  let result = getCurrentValuesForRegion(data, type);

  return result.sort((a, b) => a.value - b.value).reverse();
}
