const MAX_NUM = 50000;
const REGIONS = ["China", "Italy", "Spain", "Germany", "Iran", "US", "France", "Korea, South", "Switzerland", "United Kingdom", "Japan", "Poland"];

function processData(input) {
  let result = {
    "regions": [],
    "days": [],
  };

  let regionPos = 0;
  for (let regionName of REGIONS) {
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


async function main() {
  let data = await fetch("./data/timeseries.json").then((response) => response.json());
  const v = new Vue({
    el: '#main',
    data: {
      data: processData(data)
    }
  });
  document.getElementById("main").style.display = "block";
}

main();

