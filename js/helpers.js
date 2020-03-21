function calculateValue(value, selectedType) {
  if (selectedType == "recovered") {
    return value["recovered"] / value["confirmed"];
  }
  if (selectedType == "active") {
    return value["confirmed"] - value["deaths"] - value["recovered"];
  }
  return value[selectedType];
}

function formatValue(value, selectedType, input = null) {
  if (input === null) {
    input = calculateValue(value, selectedType);
  }

  if (selectedType == "recovered") {
    return input.toLocaleString(undefined, { style: "percent" });
  }

  return input;
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
    if (item.name === selectedType) {
      return item;
    }
  }
  return null;
}
