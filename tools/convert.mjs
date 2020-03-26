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

function getStateNames() {
  let result = {};
  
  result["USA"] = readJSONFile("./data/usa_states.json");

  return result;
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

function isState(region) {
  return region.state && !region.city && !region.county;
}

function isAlpha3Country(region) {
  return region.country.length === 3;
}

function hasMoreThanXCases(dates, x) {
  let lastDate = dates[dates.length - 1];
  return lastDate.value.cases > x;
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

function getDisplayName(entry) {
  if (!entry.meta.state.code && !entry.meta.county.code && !entry.meta.city.code) {
    return entry.meta.country.shortName;
  }
  if (!entry.meta.county.code && !entry.meta.city.code) {
    return `${entry.meta.state.name} (${entry.meta.country.shortName})`;
  }
  return entry.id;
}

function getRegionCode(region) {
  let result = [];
  if (region.country) {
    result.push(region.country);
  }
  if (region.state) {
    result.push(region.state);
  }
  if (region.county) {
    result.push(region.county);
  }
  if (region.city) {
    result.push(region.city);
  }
  return result.join("_");
}

function getStateName(stateCode, countryCode, stateNames) {
  let countryCodes = stateNames[countryCode];
  if (!countryCodes) {
    return stateCode;
  }
  let stateName = countryCodes[stateCode];
  if (!stateName) {
    return stateCode;
  }
  return stateName;
}

function convert(input, iso3166, stateNames) {
  let result = [];

  for (let regionCode in input) {
    let region = input[regionCode];

    if (!isCountry(region) && !isState(region)) {
      continue;
    }

    if (!isAlpha3Country(region)) {
      continue;
    }

    let dates = intoDatesArray(region.dates, regionCode);
    if (!hasMoreThanXCases(dates, 1)) {
      continue;
    }

    let isoEntry = getISOEntryForAlpha3(iso3166, region.country);
    if (!isoEntry) {
      console.warn(`No ISO entry for country ${region.country}, skipping.`);
      continue;
    }

    let entry = {
      "id": getRegionCode(region),
      "dates": dates,
      "meta": {
        "country": {
          "code": region.country,
          "name": isoEntry.name,
          "shortName": getShortName(isoEntry),
        },
        "state": {
          "code": region.state,
          "name": getStateName(region.state, region.country, stateNames),
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
    };
    entry.displayName = getDisplayName(entry);
    result.push(entry);
  }

  return result;
}

let oldNames = {
  "USA": "US",
  "KOR": "Korea, South",
  "TWN": "Taiwan*",
  "VNM": "Vietnam",
  "CIV": "Cote d'Ivoire",
  "GBR": "United Kingdom",
  "COD": "Congo (Kinshasa)",
  "COG": "Congo (Brazzaville)",
  "SYR": "Syria",
  "LAO": "Laos",
};
// Those regions don't have data in old timeseries.
let knownSkipped = ["MTQ", "REU", "GLP", "HKG", "MAC", "FRO", "GUF", "MYT", "GRL", "GUM", "GGY", "JEY", "PRI", "GNB", "MLI", "KNA" ];

function getOldName(region) {
  if (oldNames[region.id]) {
    return oldNames[region.id];
  }
  return region.meta.country.shortName;
}

function backFill(output, oldSource) {
  for (let region of output) {
    if (region.meta.state.code || region.meta.county.code || region.meta.city.code) {
      continue;
    }
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
        // while (oldEntry.date != newEntry.date) {
        //   console.log(`Missing data for ${region.id}`);
        //   i += 1;
        //   oldEntry = oldRegion[i];
        // }
        if (oldEntry.date != newEntry.date) {
          throw new Error(`Error when matching date ${oldEntry.date} to ${newEntry.date} for ${region.id}!`);
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
    for (let idx = 9; idx < region.dates.length; idx++) {
      let date = region.dates[idx];
      if (date.date < "2020-3-23") {
        continue;
      }
      let nextDate = region.dates[idx + 1];
      if (!nextDate) {
        continue;
      }
      if (date.value.hasOwnProperty("deaths") && !nextDate.value.hasOwnProperty("deaths")) {
        nextDate.value["deaths"] = date.value["deaths"];
      }
      if (date.value.hasOwnProperty("recovered") && !nextDate.value.hasOwnProperty("recovered")) {
        nextDate.value["recovered"] = date.value["recovered"];
        if (region.meta.country.code == "CHN") {
          nextDate.value["active"] = date.value["active"] + (nextDate.value["cases"] - date.value["cases"]) - (nextDate.value["deaths"] - date.value["deaths"]);
        }
      }
      if (!nextDate.value.hasOwnProperty("active") || nextDate.value["active"] == null) {
        nextDate.value["active"] = date.value["active"];
      }
    }
  }
}

let source = readJSONFile("./data/timeseries-byLocation.json");
let iso3166 = readJSONFile("./data/iso3166.json");
let stateNames = getStateNames();
let output = convert(source, iso3166, stateNames);

let oldSource = readJSONFile("./data/timeseries.json");
backFill(output, oldSource);

fixData(output);

writeJSON("./data/timeseries-converted.json", output);
