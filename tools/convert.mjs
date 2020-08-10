#!/usr/bin/env node

import fs from "fs";

function readJSONFile(path) {
  let source = fs.readFileSync(path, "utf8");
  let data = JSON.parse(source);
  return data;
}

function getLevelId(region, level) {
  if (level === "country") {
    if (!region.countryID.startsWith("iso1:")) {
      throw new Error(`Country id is not iso1: ${region.countryID}.`);
    }
    return region.countryID.substr(5);
  }
  if (level === "state") {
    if (!region.stateID) {
      return undefined;
    }
    if (!region.stateID.startsWith("iso2:")) {
      throw new Error(`State id is not iso2: ${region.stateID}.`);
    }
    let stateId = region.stateID.substr(5);
    let countryId = getLevelId(region, "country");
    if (!stateId.startsWith(countryId)) {
      throw new Error(`State id doesn't start with country id: ${stateID}.`);
    }
    return stateId.substr(countryId.length + 1);
  }
  if (level === "county") {
    if (!region.countyID) {
      return undefined;
    }
    if (!region.countyID.startsWith("fips:") &&
        !region.countyID.startsWith("iso2:")) {
      throw new Error(`County id is not fips/iso2: ${region.countyID}.`);
    }
    return region.countyID.substr(5);
  }
}

let shortNames = {
  "iso1:us": "USA",
};

function getRegionName(region, level, shortName) {
  if (shortName) {
    return shortNames[region.locationID];
  }
  if (level == "county") {
    return region.countyName;
  }
  if (level == "state") {
    return region.stateName;
  }
  if (level == "country") {
    return region.countryName;
  }
}

function writeJSON(path, json) {
  let string = JSON.stringify(json, null, 2);
  fs.writeFileSync(path, string);
}

const TYPES = ["cases", "deaths", "active", "recovered", "tested", "hospitalized", "hospitalized_current", "discharged", "icu", "icu_current"];

function intoDatesArray(dates, regionId) {
  const result = {
    dates: [],
    latest: {},
    highest: {},
  };
  let prev = 0;
  for (let date in dates) {
    if (dates[date]["cases"] < prev) {
      console.warn(`Number of cases for ${regionId} dropped from ${prev} to ${dates[date]["cases"]}`);
    }
    prev = dates[date]["cases"];

    let value = {};

    for (let type in dates[date]) {
      if (!TYPES.includes(type)) {
        if (type != "growthFactor") {
          throw new Error(type);
        }
        continue;
      }
      if (result.highest[type] === undefined || result.highest[type] < dates[date][type]) {
        result.highest[type] = dates[date][type];
      }
      result.latest[type] = result.dates.length;
      value[type] = dates[date][type];
    }
    result.dates.push({
      date,
      value
    });
  }
  return result;
}

function hasMoreThanXCases(dataSet, latest, x) {
  return dataSet[latest.cases].value["cases"] > x;
}

function getDisplayName(region) {
  if (region.level == "country") {
    return region.countryName;
  }
  return region.name;
}

function convert(input) {
  let result = {};

  for (let regionCode in input) {
    let region = input[regionCode];
    let taxonomy = region.level;
    if (!["country", "state", "county"].includes(taxonomy)) {
      continue;
    }

    let {dates, latest, highest} = intoDatesArray(region.dates, regionCode);
    if (!latest.cases) {
      continue;
    }
    if (!hasMoreThanXCases(dates, latest, 200)) {
      continue;
    }

    let id = region.slug;

    let entry = {
      "id": id,
      "dates": dates,
      "latest": latest,
      "highest": highest,
      "meta": {
        "country": {
          "code": getLevelId(region, "country"),
          "name": getRegionName(region, "country", false),
          "shortName": getRegionName(region, "country", true),
        },
        "state": {
          "code": getLevelId(region, "state"),
          "name": getRegionName(region, "state"),
        },
        "county": {
          "code": getLevelId(region, "county"),
          "name": getRegionName(region, "county"),
        },
        "population": region.population,
        "taxonomy": taxonomy,
      },
    };
    entry.displayName = getDisplayName(region);
    if (!result[taxonomy]) {
      result[taxonomy] = {};
    }
    result[taxonomy][id] = entry;
  }

  return result;
}

let source = readJSONFile("./data/timeseries-byLocation.json");
let output = convert(source);

for (const taxonomy in output) {
  writeJSON(`./public/timeseries-${taxonomy}.json`, output[taxonomy]);
}
