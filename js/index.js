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

const isSameDay = (date1, date2) => {
  return date1.getDate() == date2.getDate() &&
    date1.getMonth() == date2.getMonth() &&
    date1.getFullYear() == date2.getFullYear()
}
const isToday = (someDate) => {
  const today = new Date()
  today.setDate(today.getDate() - 1);
  return isSameDay(today, someDate);
}


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

