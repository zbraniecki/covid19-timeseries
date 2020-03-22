function getUserPreferences() {
  let result = {
    selectedType: "confirmed",
    selectedRegions: null,
  };
  let type = localStorage.getItem("selectedType");
  if (type) {
    result.selectedType = type;
  }
  let items = localStorage.getItem("selectedRegions");
  if (items) {
    result.selectedRegions = JSON.parse(items);
  }
  return result;
}

function normalizeDataSet(sortedDataSet, userPreferences) {
  let type = getType(TYPES, userPreferences.selectedType);

  for (let idx in sortedDataSet) {
    let region = sortedDataSet[idx];

    let start = null;
    for (let i = 0; i < region.days.length; i++) {
      let value = calculateValue(region.days, i, type.id);
      let nextValue = calculateValue(region.days, i + 1, type.id);
      if (nextValue > type.min) {
        start = i;
        break;
      }
    }
    if (!start) {
      for (let i = 0; i < region.days.length; i++) {
        let value = calculateValue(region.days, i, type.id);
        if (value > 0) {
          start = i;
          break;
        }
      }
    }
    if (start) {
      region.days = region.days.slice(start);
    }
  }
}

function calculateValue(daysSet, idx, type) {
  let day = daysSet[idx];
  if (!day) {
    return null;
  }

  if (type == "active") {
    return day["confirmed"] - day["deaths"] - day["recovered"];
  }
  return day[type];
}

function narrowDataSet(sortedDataSet, userPreferences) {
  let result = [];

  for (let i in sortedDataSet) {
    let region = sortedDataSet[i];
    if (
      (userPreferences.selectedRegions === null && result.length < 10) ||
      (userPreferences.selectedRegions !== null && userPreferences.selectedRegions.includes(region.name))
    ) {
      result.push(region);
    }
  }

  return result;
}

function formatValue(value, userPreferences) {
  if (userPreferences.selectedType == "recovered") {
    return value.toLocaleString(undefined, { style: "percent" });
  }

  return value;
}


// Parse a string like "2020-1-19" to a date
function parseDate(input) {
  let year;
  let month;
  let day;

  let i = 0;
  for (let chunk of input.split("-")) {
    switch (i) {
      case 0:
        year = parseInt(chunk);
        break;
      case 1:
        month = parseInt(chunk);
        break;
      case 2:
        day = parseInt(chunk);
        break;
    }
    i += 1;
  }
  let date = new Date(year, month - 1, day);
  return date;
}

// Interpolate white ([255, 255, 255]) and red([255, 0, 0]) by a factor.
function interpolateColor(color1, color2, factor) {
    if (arguments.length < 3) { 
        factor = 0.5; 
    }
    var result = color1.slice();
    for (var i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
};

// Verify if two dates are the same day.
const isSameDay = (date1, date2) => {
  return date1.getDate() == date2.getDate() &&
    date1.getMonth() == date2.getMonth() &&
    date1.getFullYear() == date2.getFullYear()
}

// Check if the date is the same as today.
// Note: substracting one day because data source ends one day short.
const isToday = (someDate) => {
  const today = new Date()
  today.setDate(today.getDate() - 1);
  return isSameDay(today, someDate);
}

function getType(types, selectedType) {
  for (let item of types) {
    if (item.id === selectedType) {
      return item;
    }
  }
  throw new Error(`Unknown type: ${selectedType}`);
}
