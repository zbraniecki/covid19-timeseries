const MAX_NUM = 50000;
const TYPES = [
  {
    "id": "confirmed",
    "name": "confirmed",
    "max": 50000,
    "min": 200,
  },
  // {
  //   "id": "confirmed_delta",
  //   "name": "confirmed Δ",
  //   "max": 0.2,
  //   "min": 200,
  // },
  {
    "id": "deaths",
    "name": "deaths",
    "max": 4000,
    "min": 30,
  },
  {
    "id": "active",
    "name": "active",
    "max": 50000,
    "min": 200,
  },
];

function processMainData(dataSet, userPreferences) {
  let result = {
    "regions": [],
    "days": [],
  };

  let type = getType(TYPES, userPreferences.selectedType);

  for (let i in dataSet) {
    let region = dataSet[i];
    result.regions.push(region.name);

    for (let idx in region.days) {
      let day = region.days[idx];

      if (!result.days[idx]) {
        result.days[idx] = {
          "num": idx,
          "values": new Array(dataSet.length).fill(null),
        }
      }

      let value = calculateValue(region.days, idx, type.id);
      let date = parseDate(day.date);
      result.days[idx].values[i] = {
        "region": region.name,
        "date": date,
        "value": formatValue(value, userPreferences),
        "min": value < type.min,
        "color": interpolateColor([255, 255, 255], [255, 0, 0], value / type.max),
        "isToday": isToday(date),
      };
    }
  }
  return result;
}

function processData(sortedDataSet, userPreferences) {
  let result = {
    "legend": {
      "min": null,
    },
    "selectedType": userPreferences.selectedType,
    "main": null,
    "select": {
      "types": null,
      "regions": null
    }
  };

  let type = getType(TYPES, userPreferences.selectedType);
  result.legend.min = `Last day below ${type.min} ${type.name}.`;

  let selectedDataSet = narrowDataSet(sortedDataSet, userPreferences);
  result.main = processMainData(selectedDataSet, userPreferences);

  result.select.types = TYPES.map(type => type.name);
  result.select.regions = sortedDataSet.map(region => {
    let value = calculateValue(region.days, region.days.length - 1, type.id);
    return {
      "name": region.name,
      "value": formatValue(value, userPreferences),
    };
  });
  return result;
}


async function main() {
  let dataSet = await fetch("./data/timeseries.json").then((response) => response.json());

  let userPreferences = getUserPreferences();

  let sortedDataSet = sortDataSet(dataSet, userPreferences);
  normalizeDataSet(sortedDataSet, userPreferences);

  let data = processData(sortedDataSet, userPreferences);

  const v = new Vue({
    el: '#app',
    data: {
      data
    }
  });
  document.getElementById("app").style.display = "grid";

  document.getElementById("regionSelect").addEventListener("change", function () {
    let selected = [];
    for (let i = 0; i < this.options.length; i++) {
      if (this.options[i].selected) {
        selected.push(this.options[i].value);
      }
    }
    userPreferences.selectedRegions = selected;
    let selectedDataSet = narrowDataSet(sortedDataSet, userPreferences);
    v.data.main = processMainData(selectedDataSet, userPreferences);
    localStorage.setItem("selectedRegions", JSON.stringify(selected));
  });

  document.getElementById("typeSelect").addEventListener("change", function () {
    userPreferences.selectedType = this.value;
    sortedDataSet = sortDataSet(dataSet, userPreferences);
    normalizeDataSet(sortedDataSet, userPreferences);
    v.data = processData(sortedDataSet, userPreferences);
    localStorage.setItem("selectedType", userPreferences.selectedType);
  });
}

main();

