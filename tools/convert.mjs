#!/usr/bin/env node

import fs from "fs";

function readJSONFile(path) {
  let source = fs.readFileSync(path, "utf8");
  let data = JSON.parse(source);
  return data;
}

function writeJSON(path, json) {
  let string = JSON.stringify(json, null, 2);
  fs.writeFileSync(path, string);
}

function intoDatesArray(dates, regionId) {
  let result = [];
  let prev = 0;
  for (let date in dates) {
    if (dates[date]["cases"] < prev) {
      console.warn(`Number of cases for ${regionId} dropped from ${prev} to ${dates[date]["cases"]}`);
    }
    prev = dates[date]["cases"];
    result.push({
      date,
      value: dates[date]
    });
  }
  return result;
}

function getISOEntryForAlpha3(iso3166, alpha3) {
  for (let entry of iso3166) {
    if (entry["alpha-3"] === alpha3) {
      return entry;
    }
  }
  return undefined;
}

function isCountry(region) {
  return !region.state && !region.city && !region.county;
}

function isAlpha3Country(region) {
  return region.country.length === 3;
}

function hasMoreThanXCases(dates, x) {
  let lastDate = dates[dates.length - 1];
  return lastDate.value.cases > x;
}

function maybeAddToChina(china, region) {
  if (region.country !== "CHN" &&
    region.country !== "MAC" &&
    region.country !== "HKG") {
    return;
  }
  if (region.county || region.city) {
    return;
  }

  let dates = intoDatesArray(region.dates, region.state);
  for (let idx in dates) {
    let date = dates[idx];
    let found = false;
    for (let chinaDate of china.dates) {
      if (chinaDate.date == date.date) {
        for (let type in date.value) {
          if (chinaDate.value[type]) {
            chinaDate.value[type] += date.value[type];
          } else {
            chinaDate.value[type] = date.value[type];
          }
          found = true;
          break;
        }
      }
    }
    if (!found) {
      china.dates.push(date);
    }
  }
}

let shortNames = {
  "GBR": "Great Britain",
  "USA": "USA",
  "RUS": "Russia",
  "BRN": "Brunei",
  "KOR": "South Korea",
};

function getShortName(iso3166Entry) {
  let name = iso3166Entry.name;
  
  if (shortNames[iso3166Entry["alpha-3"]]) {
    return shortNames[iso3166Entry["alpha-3"]];
  }

  let comma = name.indexOf(",");
  if (comma != -1) {
    return name.substr(0, comma);
  }
  let bracket = name.indexOf("(");
  if (bracket != -1) {
    return name.substr(0, bracket - 1);
  }
  return name;
}

function convert(input) {
  let result = [];

  let china = {
    "id": "CHN",
    "dates": [],
    "meta": {
      "country": {
        "code": "CHN",
        "name": "China",
        "shortName": "China",
      },
      "state": {},
      "county": {},
      "city": {},
      "rating": undefined,
      "tz": undefined,
      "population": 1427647786,
    },
  };
  result.push(china);

  for (let regionCode in input) {
    let region = input[regionCode];

    maybeAddToChina(china, region);

    if (!isCountry(region)) {
      continue;
    }

    if (!isAlpha3Country(region)) {
      continue;
    }

    let dates = intoDatesArray(region.dates, regionCode);
    if (!hasMoreThanXCases(dates, 20)) {
      continue;
    }

    let isoEntry = getISOEntryForAlpha3(iso3166, region.country);

    result.push({
      "id": regionCode,
      "dates": dates,
      "meta": {
        "country": {
          "code": region.country,
          "name": isoEntry.name,
          "shortName": getShortName(isoEntry),
        },
        "state": {
          "code": region.state,
        },
        "county": {
          "code": region.county,
        },
        "city": {
          "code": region.city,
        },
        "rating": region.rating,
        "tz": region.tz,
        "population": region.population,
      },
    });
  }

  china.dates = china.dates.sort((a, b) => a.date - b.date);

  return result;
}

let oldNames = {
  "USA": "US",
  "KOR": "Korea, South",
  "TWN": "Taiwan*",
  "VNM": "Vietnam",
  "CIV": "Cote d'Ivoire",
  "GBR": "United Kingdom",
};
// Those regions don't have data in old timeseries.
let knownSkipped = ["COD", "MTQ", "REU", "GLP", "HKG", "MAC", "FRO", ];

function getOldName(region) {
  if (oldNames[region.id]) {
    return oldNames[region.id];
  }
  return region.meta.country.shortName;
}

function backFill(output, oldSource) {
  for (let region of output) {
    if (knownSkipped.includes(region.id)) {
      continue;
    }
    let oldRegion = oldSource[getOldName(region)];
    if (!oldRegion) {
      throw new Error(`Missing region for ${region.id}.`);
    }

    // First, let's find the chunk of data that only
    // exists in old timeseries and add it.
    let firstNewEntry = region.dates[0];
    let matchingOldEntry = null;
    for (let idx in oldRegion) {
      if (oldRegion[idx].date == firstNewEntry.date) {
        matchingOldEntry = idx;
      }
    }
    if (matchingOldEntry) {
      let oldEntries = oldRegion.slice(0, matchingOldEntry).map(entry => {
        let value = {};
        for (let type in entry) {
          if (type == "date") {
            continue;
          }
          if (type == "confirmed") {
            value["cases"] = entry[type];
          } else {
            value[type] = entry[type];
          }
        }
        return {
          date: entry.date,
          value,
        };
      });
      region.dates.splice(0, 0, ...oldEntries);
    }


    // Now, let's find all matching data and extend from old timeseries
    // onto the new one.
    let newIndex = null;
    for (let i = 0; i < region.dates.length; i++) {
      if (oldRegion[0].date == region.dates[i].date) {
        newIndex = i;
        break;
      }
    }
    if (newIndex !== null) {
      for (let i = 0; i < oldRegion.length; i++) {
        let oldEntry = oldRegion[i];
        let newEntry = region.dates[newIndex];
        if (oldEntry.date != newEntry.date) {
          throw new Error(`Error when matching date ${oldEntry.date} to ${newEntry.date}!`);
        }
        for (let type in oldEntry) {
          if (type === "date") {
            continue;
          }
          if (type === "confirmed") {
            type = "cases";
          }
          if (!newEntry.value.hasOwnProperty(type)) {
            if (type == "cases") {
              newEntry.value[type] = oldEntry["confirmed"];
            } else {
              newEntry.value[type] = oldEntry[type];
            }
          }
        }
        newIndex += 1;
      }
    }
  }
}

function fixData(output) {
  for (let region of output) {
    if (region.id !== "CHN") {
      continue;
    }
    let lastDay = region.dates[region.dates.length - 1];
    if (!lastDay.value["recovered"]) {
      let oneButLastDay = region.dates[region.dates.length - 2];
      lastDay.value["recovered"] = oneButLastDay.value["recovered"];
      lastDay.value["active"] = oneButLastDay.value["active"] + (lastDay.value["cases"] - oneButLastDay.value["cases"]) - (lastDay.value["deaths"] - oneButLastDay.value["deaths"]);
    }
  }
}

let source = readJSONFile("./data/timeseries-byLocation.json");
let iso3166 = readJSONFile("./data/iso3166.json");
let output = convert(source, iso3166);

let oldSource = readJSONFile("./data/timeseries.json");
backFill(output, oldSource);
fixData(output);

writeJSON("./data/timeseries-converted.json", output);
