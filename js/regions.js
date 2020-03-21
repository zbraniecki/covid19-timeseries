function getCurrentValuesForRegion(data) {
  let result = [];

  for (let regionName in data) {
    let region = data[regionName];
    let last = region[region.length - 1].confirmed;
    result.push({
      region: regionName,
      value: last,
    });
  }

  return result;
}

function getSortedRegions(data) {
  let result = getCurrentValuesForRegion(data);

  return result.sort((a, b) => a.value - b.value).reverse();
}
