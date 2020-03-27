const SETTINGS = {
  views: [
    {
      "id": "total",
      "name": "Total",
      "style": "decimal",
    },
    {
      "id": "delta",
      "name": "Delta",
      "style": "percent",
    },
    {
      "id": "ema",
      "name": "Exponential Moving Average",
      "style": "percent",
    },
  ],
  types: [
    {
      "id": "cases",
      "name": "cases",
      "sentiment": "negative",
      "normalize": 500,
      "views": {
        "total": {
          "max": 50000,
        },
        "delta": {
          "max": 0.5,
        },
        "ema": {
          "max": 0.3,
        },
      },
    },
    {
      "id": "deaths",
      "name": "deaths",
      "sentiment": "negative",
      "normalize": 30,
      "views": {
        "total": {
          "max": 4000,
        },
        "delta": {
          "max": 0.2,
        },
        "ema": {
          "max": 0.3,
        },
      },
    },
    {
      "id": "active",
      "name": "active",
      "sentiment": "negative",
      "normalize": 200,
      "views": {
        "total": {
          "max": 50000,
        },
        "delta": {
          "max": 0.5,
        },
        "ema": {
          "max": 0.3,
        },
      },
    },
    {
      "id": "tested",
      "name": "tested",
      "sentiment": "positive",
      "normalize": 100,
      "views": {
        "total": {
          "max": 50000,
        },
        "delta": {
          "max": 0.5,
        },
        "ema": {
          "max": 0.3,
        },
      },
    },
  ],
  "taxonomies": [
    {
      "id": "country",
      "name": "Country",
    },
    {
      "id": "state",
      "name": "State",
    },
  ],
};

function processMainData(dataSet, userPreferences) {
  let result = {
    "rows": {
      "population": false,
      "country": false,
      "state": false,
      "county": false,
    },
    "regions": [],
    "dates": [],
  };

  let {type, view} = getTypeAndView(SETTINGS, userPreferences);

  for (let i in dataSet) {
    let region = dataSet[i];

    {
      let countryName = getTaxonomyName(region.meta.country);

      let name;
      let country;
      if (region.meta.taxonomy == "country") {
        name = countryName;
      } else {
        name = getTaxonomyName(region.meta.state);
        country = countryName;
        result.rows.country = true;
      }

      if (region.meta.population) {
        result.rows.population = true;
      }
      let entry = {
        "id": region.id,
        "name": name,
        "country": country,
        "population": nFormatter(region.meta.population, 2),
      };
      result.regions.push(entry);
    }

    if (region.normalized["status"] === "none") {
      continue;
    }
    let startIdx = region.normalized.value;

    for (let idx = startIdx; idx < region.dates.length; idx++) {
      let day = region.dates[idx];

      let relIdx = idx - startIdx;

      if (!result.dates[relIdx]) {
        result.dates[relIdx] = {
          "num": relIdx,
          "values": new Array(dataSet.length).fill(null),
        }
      }

      let value = calculateValue(region.dates, idx, type, view);
      let date = parseDate(day.date);

      let maxColor =
        (type.sentiment == "positive" && value > 0) || (type.sentiment == "negative" && value < 0) ? [0, 255, 0] : [255, 0, 0];
      let colorVector = value > 0 ? 1 : -1;
      result.dates[relIdx].values[i] = {
        "region": region.id,
        "date": date,
        "value": formatValue(value, userPreferences),
        "normalized": region.normalized["status"] === "normalized",
        "color": interpolateColor([255, 255, 255], maxColor, (value / type.views[view.id].max) * colorVector),
        "isToday": isToday(date),
      };
    }
  }
  return result;
}

function processRegionData(sortedDataSet, userPreferences) {
  let {type, view} = getTypeAndView(SETTINGS, userPreferences);
  let typeFilter = userPreferences.selectedTaxonomies;

  return sortedDataSet.filter(region => isRegionInUserPreferences(region, userPreferences))
  .map(region => {
    let value = calculateValue(region.dates, region.dates.length - 1, type, view);
    let search = `${region.meta.country.code.toLowerCase()} ${getTaxonomyName(region.meta.country).toLowerCase()}`;
    if (region.meta.taxonomy == "state") {
      search += `${region.meta.state.code.toLowerCase()} ${getTaxonomyName(region.meta.state).toLowerCase()}`;
    }
    return {
      "id": region.id,
      "name": region.displayName,
      "country": region.meta.country,
      "state": region.meta.state,
      "county": region.meta.county,
      "search": search,
      "visible": true,
      "value": formatValue(value, userPreferences),
    };
  });
}

function filterByNeedle(regions, needle) {
  for (let region of regions) {
    if (!needle || region.search.includes(needle)) {
      region.visible = true;
    } else {
      region.visible = false;
    }
  }
}

function processData(sortedDataSet, userPreferences) {
  let {type, view} = getTypeAndView(SETTINGS, userPreferences);
  let result = {
    "legend": {
      "min": null,
    },
    "selectedType": userPreferences.type,
    "selectedView": userPreferences.view,
    "selectedNormalize": getValueForNormalization(type, userPreferences),
    "selectedTaxonomies": userPreferences.selectedTaxonomies,
    "main": null,
    "select": {
      "types": null,
      "views": null,
      "regions": null,
      "taxonomies": SETTINGS.taxonomies,
    }
  };

  result.legend.min = `Last day below ${getValueForNormalization(type, userPreferences)} ${type.name}.`;

  let selectedDataSet = narrowDataSet(sortedDataSet, userPreferences);
  normalizeDataSet(selectedDataSet, userPreferences);
  result.main = processMainData(selectedDataSet, userPreferences);

  result.select.types = SETTINGS.types;
  result.select.views = SETTINGS.views;
  result.select.regions = processRegionData(sortedDataSet, userPreferences);
  return result;
}


async function main() {
  let dataSet = await fetch("./data/timeseries-converted.json").then((response) => response.json());

  let userPreferences = getUserPreferences();

  let sortedDataSet = sortDataSet(dataSet, userPreferences);

  let data = processData(sortedDataSet, userPreferences);

  const v = new Vue({
    el: '#app',
    data: {
      data
    }
  });
  document.getElementById("app").style.display = "grid";

  document.getElementById("regionSelect").addEventListener("change", function () {
    let filterElement = document.getElementById("regionFilter");
    let filter = filterElement.value;

    let selected = filter.length > 0 ? userPreferences.regions : [];

    for (let i = 0; i < this.options.length; i++) {
      if (this.options[i].classList.contains("filteredOut")) {
        continue;
      }
      if (this.options[i].selected) {
        selected.push(this.options[i].value);
      } else if (filter.length > 0) {
        selected = selected.filter(item => item != this.options[i].value);
      }
    }

    userPreferences.regions = selected;
    let selectedDataSet = narrowDataSet(sortedDataSet, userPreferences);
    normalizeDataSet(selectedDataSet, userPreferences);
    v.data.main = processMainData(selectedDataSet, userPreferences);

    let params = getSearchParams();
    params.delete("region");
    for (let id of selected) {
      params.append("region", id);
    }
    setURL(params);
  });

  document.getElementById("typeSelect").addEventListener("change", function () {
    userPreferences.type = this.value;
    userPreferences.normalize = null;
    sortedDataSet = sortDataSet(dataSet, userPreferences);
    v.data = processData(sortedDataSet, userPreferences);

    let params = getSearchParams();
    params.set("type", userPreferences.type);
    params.delete("normalize");
    setURL(params);
  });

  document.getElementById("viewSelect").addEventListener("change", function () {
    userPreferences.view = this.value;
    v.data = processData(sortedDataSet, userPreferences);
    let params = getSearchParams();
    params.set("view", userPreferences.view);
    setURL(params);
  });

  document.getElementById("normalizeSelect").addEventListener("change", function () {
    if (this.value.length > 0 && !isNaN(parseInt(this.value))) {
      userPreferences.normalize = parseInt(this.value);
    } else {
      userPreferences.normalize = null;
    }
    v.data = processData(sortedDataSet, userPreferences);
    let params = getSearchParams();
    if (userPreferences.normalize == null) {
      params.delete("normalize");
    } else {
      params.set("normalize", userPreferences.normalize);
    }
    setURL(params);
  });

  document.getElementById("regionFilter").addEventListener("input", function () {
    let filterElement = document.getElementById("regionFilter");
    let filterText = filterElement.value;
    let needle = filterText.toLowerCase();

    filterByNeedle(v.data.select.regions, needle);
  });

  document.getElementById("regionFilterClear").addEventListener("click", function () {
    document.getElementById("regionFilter").value = "";
    filterByNeedle(v.data.select.regions, null);
  });

  document.querySelectorAll("#sidebar .taxonomyCheckbox").forEach(elem => {
    elem.addEventListener("click", function () {
      let value = this.value;
      if (this.checked && !userPreferences.selectedTaxonomies.includes(value)) {
        userPreferences.selectedTaxonomies.push(value);
      } else if (!this.checked && userPreferences.selectedTaxonomies.includes(value)) {
        userPreferences.selectedTaxonomies = userPreferences.selectedTaxonomies.filter(item => item !== value);
      }
      v.data = processData(sortedDataSet, userPreferences);
      let params = getSearchParams();
      params.delete("tax");
      for (let tax of userPreferences.selectedTaxonomies) {
        params.append("tax", tax);
      }
      setURL(params);
    });
  });
}

main();

