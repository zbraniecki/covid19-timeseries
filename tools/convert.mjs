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
  let result = {
    dates: [],
    latest: {},
  };
  let prev = 0;
  for (let date in dates) {
    if (date == "2020-04-05") {
      continue;
    }
    if (dates[date]["cases"] < prev) {
      console.warn(`Number of cases for ${regionId} dropped from ${prev} to ${dates[date]["cases"]}`);
    }
    prev = dates[date]["cases"];
    for (let type in dates[date]) {
      if (type == "growthFactor") {
        continue;
      }
      result.latest[type] = result.dates.length;
    }
    result.dates.push({
      date,
      value: dates[date]
    });
  }
  return result;
}

function getISOEntryForAlpha3(iso3166, alpha3) {
  if (alpha3 === "United States") {
    alpha3 = "USA";
  }
  for (let entry of iso3166) {
    if (entry["alpha-3"] === alpha3) {
      return entry;
    }
  }
  return undefined;
}

// Workaround some US states getting `aggregate: "county"`
function getRegionTaxonomy(region) {
  if (region.city) {
    return "city";
  }
  if (region.county) {
    return "county";
  }
  if (region.state) {
    return "state";
  }
  return "country";
}

function hasMoreThanXCases(dataSet, latest, x) {
  return dataSet[latest.cases].value["cases"] > x;
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
  return undefined;
}

function getTaxonomyName(tax) {
  if (tax.shortName) {
    return tax.shortName;
  }
  return tax.name;
}

function getDisplayName(entry) {
  let parts = [];

  let countryName = getTaxonomyName(entry.meta.country);
  parts.push(countryName);

  let stateName = getTaxonomyName(entry.meta.state);

  if (stateName) {
    parts.push(stateName);
  }

  if (entry.meta.county.code) {
    parts.push(entry.meta.county.code);
  }

  let name = parts.pop();

  if (parts.length == 0) {
    return name;
  }
  return `${name} (${parts.reverse().join(", ")})`;
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
    let taxonomy = getRegionTaxonomy(region);
    if (!["country", "state", "county"].includes(taxonomy)) {
      continue;
    }

    let {dates, latest} = intoDatesArray(region.dates, regionCode);
    if (!latest.cases) {
      continue;
    }
    if (!hasMoreThanXCases(dates, latest, 200)) {
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
      "latest": latest,
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
        "taxonomy": taxonomy,
      },
    };
    entry.displayName = getDisplayName(entry);
    result.push(entry);
  }

  return result;
}

let source = readJSONFile("./data/timeseries-byLocation.json");
let iso3166 = readJSONFile("./data/iso3166.json");
let stateNames = getStateNames();
let output = convert(source, iso3166, stateNames);

writeJSON("./data/timeseries-converted.json", output);
