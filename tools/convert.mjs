#!/usr/bin/env node

import fs from "fs";

function readJSONFile(path) {
  let source = fs.readFileSync(path, "utf8");
  let data = JSON.parse(source);
  return data;
}

function getLevelId(region, level) {
  if (level === "city") {
    if (region.cityId) {
      if (!region.cityId.startsWith("iso1:")) {
        throw new Error(`City id is not iso1: ${region.countryId}.`);
      }
      return region.cityId.substr(5);
    }
    return region.city;
  }
  if (level === "country") {
    if (!region.countryId.startsWith("iso1:")) {
      throw new Error(`Country id is not iso1: ${region.countryId}.`);
    }
    return region.countryId.substr(5);
  }
  if (level === "state") {
    if (region.stateId) {
      if (!region.stateId.startsWith("iso2:")) {
        throw new Error(`State id is not iso2: ${region.stateId}.`);
      }
      let stateId = region.stateId.substr(5);
      let countryId = getLevelId(region, "country");
      if (!stateId.startsWith(countryId)) {
        throw new Error(`State id doesn't start with country id: ${stateId}.`);
      }
      return stateId.substr(countryId.length + 1);
    }
    if (region.state) {
      return region.state;
    }
    return undefined;
  }
  if (level === "county") {
    if (region.countyId) {
      if (!region.countyId.startsWith("fips:") &&
          !region.countyId.startsWith("iso2:")) {
        throw new Error(`County id is not fips/iso2: ${region.countyId}.`);
      }
      return region.countyId.substr(5);
    }
    if (region.county) {
      return region.county;
    }
    return undefined;
  }
  if (level === "feature") {
    if (!region.featureId) {
      let city = getLevelId(region, "city");
      let county = getLevelId(region, "county");
      let state = getLevelId(region, "state");
      let country = getLevelId(region, "country");
      let parts = [country, state, county, city];
      return parts.filter(part => part).join("_");
    }
    if (typeof region.featureId === "number") {
      return region.featureId.toString();
    }
    if (region.featureId.startsWith("iso1:")) {
      return region.featureId.substr(5);
    }
    if (region.featureId.startsWith("iso2:")) {
      return region.featureId.substr(5);
    }
    if (region.featureId.startsWith("fips:")) {
      return region.featureId.substr(5);
    }
    throw new Error(`Country id is not a proper code: ${region.featureId}.`);
  }
}

let shortNames = {
  "iso1:US": "USA",
};

function getRegionName(region, level, shortName) {
  if (level === "country") {
    if (shortName === true) {
      if (shortNames[region.countryId]) {
        return shortNames[region.countryId];
      } else {
        return undefined;
      }
    }
    if (!region.country) {
      throw new Error(`Country doesn't have a name: ${region.featureId}.`);
    }
    return region.country;
  }
  if (level === "state") {
    return region.state;
  }
  if (level === "county") {
    return region.county;
  }
  if (level === "city") {
    return region.city;
  }
}

function writeJSON(path, json) {
  let string = JSON.stringify(json, null, 2);
  fs.writeFileSync(path, string);
}

const TYPES = ["cases", "deaths", "active", "recovered", "tested"];

function intoDatesArray(dates, regionId) {
  let result = {
    dates: [],
    latest: {},
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
        continue;
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

// Workaround some US states getting `aggregate: "county"`
function getRegionTaxonomy(region) {
  if (!region.level) {
    throw new Error(`Unknown level for region: ${region.name}.`);
  }
  return region.level;
}

function hasMoreThanXCases(dataSet, latest, x) {
  return dataSet[latest.cases].value["cases"] > x;
}

function getDisplayName(region) {
  let cityName = getRegionName(region, "city");
  if (cityName) {
    let stateId = getLevelId(region, "state");
    let countryId = getLevelId(region, "country");
    if (stateId) {
      return `${cityName} (${stateId}, ${countryId})`;
    } else {
      return `${cityName} (${countryId})`;
    }
  }

  let countyName = getRegionName(region, "county");
  if (countyName) {
    let countryId = getLevelId(region, "country");
    let stateId = getLevelId(region, "state");
    if (stateId) {
      return `${countyName} (${stateId}, ${countryId})`;
    } else {
      return `${countyName} (${countryId})`;
    }
  }

  let stateName = getRegionName(region, "state");
  if (stateName) {
    let countryId = getLevelId(region, "country");
    return `${stateName} (${countryId})`;
  }

  let countryName = getRegionName(region, "country", true);
  if (!countryName) {
    countryName = getRegionName(region, "country");
  }
  return countryName;
}

let ids = {};

function convert(input) {
  let result = {};

  for (let regionCode in input) {
    let region = input[regionCode];
    let taxonomy = getRegionTaxonomy(region);
    if (!["country", "state", "county", "city"].includes(taxonomy)) {
      continue;
    }

    let {dates, latest} = intoDatesArray(region.dates, regionCode);
    if (!latest.cases) {
      continue;
    }
    if (!hasMoreThanXCases(dates, latest, 200)) {
      continue;
    }

    let id = getLevelId(region, "feature");
    if (ids[id]) {
      throw new Error(`ID already exists: ${id}`);
    } else {
      ids[id] = true;
    }

    let entry = {
      "id": id,
      "dates": dates,
      "latest": latest,
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
        "city": {
          "code": getLevelId(region, "city"),
          "name": getRegionName(region, "city"),
        },
        "population": region.population,
        "taxonomy": taxonomy,
      },
    };
    entry.displayName = getDisplayName(region);
    result[id] = entry;
  }

  return result;
}

let source = readJSONFile("./data/timeseries-byLocation.json");
let output = convert(source);

writeJSON("./public/timeseries-converted.json", output);
