const MAX_NUM = 50000;
const TYPES = [
  {
    "name": "confirmed",
    "max": 50000,
    "min": 200,
  },
  {
    "name": "deaths",
    "max": 3000,
    "min": 30,
  },
];

function processMainData(input, regions, selectedItems, selectedType) {
  let result = {
    "regions": [],
    "days": [],
  };

  let type = getType(TYPES, selectedType);

  let regionPos = 0;
  for (let item of regions) {
    let regionName = item.region;

    if (!selectedItems.includes(regionName)) {
      continue;
    }

    let region = input[regionName];
    
    let firstAbove = region.findIndex(value => value[selectedType] >= type.min);
    if (firstAbove == -1 || firstAbove == 0) {
      continue;
    }

    result.regions.push(regionName);


    let lastBelow = firstAbove - 1;

    let dayNum = 0;
    for (let value of region) {
      if (dayNum < lastBelow) {
        dayNum += 1;
        continue;
      }
      let relDayNum = dayNum - lastBelow;
      if (!result.days[relDayNum]) {
        result.days[relDayNum] = {
          "day": relDayNum,
          "values": [],
        };
      }

      while (result.days[relDayNum].values.length < regionPos) {
        result.days[relDayNum].values.push(undefined);
      }

      result.days[relDayNum].values.push({
        "region": region.region,
        "date": parseDate(value.date),
        "value": value[selectedType],
        "min": value[selectedType] < type.min,
        "color": interpolateColor([255, 255, 255], [255, 0, 0], value[selectedType] / type.max),
        "isToday": isToday(parseDate(value.date)),
        "quarantine": false,
      });
      dayNum += 1;
    }

    // for (let value of region.events) {
    //   for (let day of result.days) {
    //     let item = day.values[day.values.length - 1];
    //     if (isSameDay(item.date, value.date)) {
    //       item.quarantine = true;
    //     }
    //   }
    // }
    regionPos += 1;
  }
  return result;
}

function processData(input, selectedItems, selectedType) {
  let regions = getSortedRegions(input, selectedType);

  if (selectedItems === null) {
    selectedItems = regions.map(item => item.region).slice(0, 10);
  }

  let type = getType(TYPES, selectedType);

  let result = {
    "legend": {
      "min": `Last day below ${type.min} ${type.name}.`,
    },
    "selectedType": selectedType,
    "main": processMainData(input, regions, selectedItems, selectedType),
    "select": {
      "types": TYPES.map(type => type.name),
      regions,
    }
  };
  return result;
}


async function main() {
  let inputData = await fetch("./data/timeseries.json").then((response) => response.json());

  let selectedItems = null;
  let selectedType = "confirmed";
  let items = localStorage.getItem("selectedRegions");
  if (items) {
    selectedItems = JSON.parse(items);
  }
  let type = localStorage.getItem("selectedType");
  if (type) {
    selectedType = type;
  }
  data = processData(inputData, selectedItems, selectedType);

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
    let regions = getSortedRegions(inputData, v.data.selectedType);
    v.data.main = processMainData(inputData, regions, selected, v.data.selectedType);
    localStorage.setItem("selectedRegions", JSON.stringify(selected));
  });

  document.getElementById("typeSelect").addEventListener("change", function () {
    v.data.selectedType = this.value;
    let regions = getSortedRegions(inputData, v.data.selectedType);
    let type = getType(TYPES, v.data.selectedType);
    v.data.legend.min = `Last day below ${type.min} ${type.name}.`,
    v.data.main = processMainData(inputData, regions, v.data.main.regions, v.data.selectedType);
    v.data.select.regions = regions;
    localStorage.setItem("selectedType", v.data.selectedType);
  });
}

main();

