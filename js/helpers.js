function getUserPreferences() {
  let result = {
    types: ["cases"],
    view: "total",
    normalize: null,
    regions: [],
    selectedTaxonomies: ["country"],
  };
  let params = getSearchParams();

  let types = params.getAll("type");
  if (types.length > 0) {
    result.types = [];
    for (let type of types) {
      if (SETTINGS.types.find(t => t.id == type) || SETTINGS.perTypes.find(t => t.id == type)) {
        result.types.push(type);
      }
    }
  }
  let view = params.get("view");
  if (view) {
    if (SETTINGS.views.find(t => t.id == view)) {
      result.view = view;
    }
  }
  let normalize = params.get("normalize");
  if (normalize !== undefined) {
    result.normalize = normalize;
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

function getValueForNormalization(types, userPreferences) {
  if (userPreferences.normalize !== null) {
    return userPreferences.normalize;
  }

  return types[0].normalize;
}

function getMaxValue(types, view) {
  if (view.id !== "total") {
    return types[0].views[view.id].max;
  }
  if (types.length > 1 && types[1].max) {
    return types[1].max;
  }
  return types[0].views[view.id].max;
}

function getTaxonomyName(tax) {
  if (tax.shortName) {
    return tax.shortName;
  }
  return tax.name;
}

function normalizeDataSet(sortedDataSet, userPreferences) {
  let {types} = getTypesAndView(SETTINGS, userPreferences);
  let normalizedValue = getValueForNormalization(types, userPreferences);

  for (let idx in sortedDataSet) {
    let region = sortedDataSet[idx];
    let normalized = {
      "status": "none",
      "value": null,
    };

    for (let i = 0; i < region.dates.length; i++) {
      let value = calculateValue(region, i, types, getView(SETTINGS, "total"));
      let nextValue = calculateValue(region, i + 1, types, getView(SETTINGS, "total"));
      if (nextValue >= normalizedValue && value !== undefined) {
        normalized = {
          "status": "normalized",
          "value": i,
        };
        break;
      }
    }
    if (normalized["status"] === "none") {
      for (let i = 0; i < region.dates.length; i++) {
        let value = calculateValue(region, i, types, getView(SETTINGS, "total"));
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
        let value = calculateValue(region, i, types, getView(SETTINGS, "total"));
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

function calculateLatestValue(region, latest, types, view) {
  if (!latest.hasOwnProperty(types[0].id)) {
    return undefined;
  }
  return calculateValue(region, latest[types[0].id], types, view);
}

function calculateValue(region, idx, types, view) {
  let day = region.dates[idx];
  if (!day) {
    return undefined;
  }

  if (view.id === "delta") {
    let value = calculateValue(region, idx, types, getView(SETTINGS, "total"));
    if (value === undefined) {
      return undefined;
    }
    let valuePrev = calculateValue(region, idx - 1, types, getView(SETTINGS, "total"));
    if (valuePrev === undefined) {
      return undefined;
    }
    if (valuePrev === value) {
      return 0;
    }
    if (valuePrev === 0) {
      return 1;
    }
    return (value / valuePrev) - 1;
  }
  if (view.id === "ema") {
    let total = calculateValue(region, idx, types, getView(SETTINGS, "total"));
    if (total === undefined) {
      return undefined;
    }
    const total3EMA = calculateEMA(region, idx, 3, types);
    const total7EMA = calculateEMA(region, idx, 7, types);
    return (total3EMA - total7EMA) / total;
  }

  let result;
  if (types[0].id === "active" && !day.value.hasOwnProperty("active") && day.value.hasOwnProperty("recovered")) {
    result = day.value["cases"] - day.value["deaths"] - day.value["recovered"];
  } else {
    result = day.value[types[0].id];
  }

  if (result == undefined) {
    return result;
  }

  if (types.length == 1) {
    return result;
  } else {
    if (region.meta.population) {
      return Math.round(result / (region.meta.population / 1000000));
    } else {
      return result;
    }
  }
}

function isRegionInUserPreferences(region, userPreferences) {
  let typeFilter = userPreferences.selectedTaxonomies;
    if (region.meta.city.code) {
      return typeFilter.includes("city");
    }
    if (region.meta.county.code) {
      return typeFilter.includes("county");
    }
    if (region.meta.state.code) {
      return typeFilter.includes("state");
    }
    if (region.meta.country.code) {
      return typeFilter.includes("country");
    }
    return false;
}

function narrowDataSet(sortedDataSet, userPreferences) {
  let result = [];

  for (let i in sortedDataSet) {
    let region = sortedDataSet[i];
    if (!isRegionInUserPreferences(region, userPreferences)) {
      continue;
    }
    if (
      (userPreferences.regions.length === 0 && result.length < 10) ||
      (userPreferences.regions.length > 0 && userPreferences.regions.includes(region.id))
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
  let {view, types} = getTypesAndView(SETTINGS, userPreferences);

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

function getTypesAndView(settings, userPreferences) {
  let result = {
    types: [],
    view: undefined,
  };
  for (let item of settings.types) {
    if (userPreferences.types.includes(item.id)) {
      result.types.push(item);
      break;
    }
  }
  for (let item of settings.perTypes) {
    if (userPreferences.types.includes(item.id)) {
      result.types.push(item);
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

function calculateEMA(region, idx, range, types) {
  let total =  calculateValue(region, idx, types, getView(SETTINGS, "total"));
  if (idx < 1) {
    return total;
  }
  let prevTotal =  calculateEMA(region, idx - 1, range, types);
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
