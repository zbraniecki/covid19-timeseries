function getUserPreferences() {
  let result = {
    type: "cases",
    view: "total",
    regions: [],
    selectedTaxonomies: ["country"],
  };
  let params = getSearchParams();

  let type = params.get("type");
  if (type) {
    if (SETTINGS.types.find(t => t.id == type)) {
      result.type = type;
    }
  }
  let view = params.get("view");
  if (view) {
    if (SETTINGS.views.find(t => t.id == view)) {
      result.view = view;
    }
  }
  let regions = params.getAll("region");
  if (regions.length > 0) {
    result.regions = regions;
  }

  let taxonomies = params.getAll("tax");
  if (taxonomies.length > 0) {
    result.selectedTaxonomies = taxonomies;
  }
  return result;
}

function normalizeDataSet(sortedDataSet, userPreferences) {
  let {type} = getTypeAndView(SETTINGS, userPreferences);

  for (let idx in sortedDataSet) {
    let region = sortedDataSet[idx];
    let normalized = {
      "status": "none",
      "value": null,
    };

    for (let i = 0; i < region.dates.length; i++) {
      let value = calculateValue(region.dates, i, type, getView(SETTINGS, "total"));
      let nextValue = calculateValue(region.dates, i + 1, type, getView(SETTINGS, "total"));
      if (nextValue >= type.views["total"].min && value !== undefined) {
        normalized = {
          "status": "normalized",
          "value": i,
        };
        break;
      }
    }
    if (normalized["status"] === "none") {
      for (let i = 0; i < region.dates.length; i++) {
        let value = calculateValue(region.dates, i, type, getView(SETTINGS, "total"));
        if (value !== undefined && value > 0) {
          normalized = {
            "status": "firstNonZero",
            "value": i,
          }
          break;
        }
      }
    }
    if (normalized["status"] === "none") {
      for (let i = 0; i < region.dates.length; i++) {
        let value = calculateValue(region.dates, i, type, getView(SETTINGS, "total"));
        if (value !== undefined) {
          normalized = {
            "status": "firstValue",
            "value": i,
          }
          break;
        }
      }
    }
    region.normalized = normalized;
  }
}

function getNormalizedType(types, type) {
  if (type.base !== null) {
    return getType(types, type.base);
  }
  return type;
}

function calculateValue(datesSet, idx, type, view) {
  let day = datesSet[idx];
  if (!day) {
    return undefined;
  }

  if (view.id === "delta") {
    let value = calculateValue(datesSet, idx, type, getView(SETTINGS, "total"));
    let valuePrev = calculateValue(datesSet, idx - 1, type, getView(SETTINGS, "total"));
    if (valuePrev === undefined) {
      return undefined;
    }
    return (value / valuePrev) - 1;
  }
  if (view.id === "ema") {
    let total = calculateValue(datesSet, idx, type, getView(SETTINGS, "total"));
    if (total === undefined) {
      return undefined;
    }
    const total3EMA = calculateEMA(datesSet, idx, 3, type);
    const total7EMA = calculateEMA(datesSet, idx, 7, type);
    return (total3EMA - total7EMA) / total;
  }

  if (type.id === "active" && !day.value.hasOwnProperty("active")) {
    return day.value["cases"] - day.value["deaths"] - day.value["recovered"];
  }

  return day.value[type.id];
}

function narrowDataSet(sortedDataSet, userPreferences) {
  let result = [];

  for (let i in sortedDataSet) {
    let region = sortedDataSet[i];
    if (
      (userPreferences.regions === null && result.length < 10) ||
      (userPreferences.regions !== null && userPreferences.regions.includes(region.id))
    ) {
      result.push(region);
    }
  }

  return result;
}

function formatValue(value, userPreferences) {
  if (value === undefined) {
    return "?";
  }
  let {view} = getTypeAndView(SETTINGS, userPreferences);
  
  return value.toLocaleString(undefined, { style: view.style });
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

function getTypeAndView(settings, userPreferences) {
  let result = {
    type: undefined,
    view: undefined,
  };
  for (let item of settings.types) {
    if (item.id === userPreferences.type) {
      result.type = item;
      break;
    }
  }
  for (let item of settings.views) {
    if (item.id === userPreferences.view) {
      result.view = item;
      break;
    }
  }
  return result;
}

function getView(settings, id) {
  for (let item of settings.views) {
    if (item.id === id) {
      return item;
    }
  }
  return undefined;
}

function calculateEMA(daysSet, idx, range, type) {
  let total =  calculateValue(daysSet, idx, type, getView(SETTINGS, "total"));
  if (idx < 1) {
    return total;
  }
  let prevTotal =  calculateEMA(daysSet, idx - 1, range, type);
  if (!prevTotal) {
    return total;
  }

  var k = 2/(range + 1);
  return total * k + prevTotal * (1 - k);
}

function getSearchParams() {
  return new URLSearchParams(document.location.search);
}

function setURL(params) {
  window.history.replaceState({}, '', `${document.location.pathname}?${params}`);

}

function nFormatter(num, digits) {
  if (!num) {
    return "";
  }
  const si = [
    { value: 1, symbol: "" },
    { value: 1E3, symbol: " k" },
    { value: 1E6, symbol: " M" },
    { value: 1E9, symbol: " B" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let i;
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}
