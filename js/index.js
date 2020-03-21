const MAX_NUM = 50000;

function processMainData(input, regions, selectedItems) {
  let result = {
    "regions": [],
    "days": [],
  };

  let regionPos = 0;
  for (let item of regions) {
    let regionName = item.region;

    if (!selectedItems.includes(regionName)) {
      continue;
    }

    let region = input[regionName];
    
    let firstAbove = region.findIndex(value => value.confirmed >= 200);
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
        "value": value.confirmed,
        "below200": value.confirmed < 200,
        "color": interpolateColor([255, 255, 255], [255, 0, 0], value.confirmed / MAX_NUM),
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

function processData(input, selectedItems = null) {
  let regions = getSortedRegions(input);

  if (selectedItems === null) {
    selectedItems = regions.map(item => item.region).slice(0, 10);
  }
  console.log(selectedItems);

  let result = {
    "main": processMainData(input, regions, selectedItems),
    "select": regions,
  };
  console.log(result);
  return result;
}


async function main() {
  let inputData = await fetch("./data/timeseries.json").then((response) => response.json());

  let selectedItems = null;
  let items = localStorage.getItem("selectedRegions");
  if (items) {
    selectedItems = JSON.parse(items);
  }
  data = processData(inputData, selectedItems);

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
    let regions = getSortedRegions(inputData);
    v.data.main = processMainData(inputData, regions, selected);
    localStorage.setItem("selectedRegions", JSON.stringify(selected));
  });
}

main();

