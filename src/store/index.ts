import Vue from "vue";
import Vuex from "vuex";
import helpers from "@/helpers/index.ts";

Vue.use(Vuex);

enum Views {
  Table = "Table",
  Chart = "Chart",
}

type DataType = "cases" | "deaths" | "active" | "recovered" | "tested";
type TaxonomyType = "country" | "state" | "county" | "city";

interface DataPoint {
  date: Date;
  value: {
    cases: number;
    deaths: number;
    active?: number;
    recovered?: number;
    tested?: number;
  };
}

interface Region {
  id: string;
  dates: Array<DataPoint>;
  latest: {
    cases: number;
    deaths: number;
    active?: number;
    recovered?: number;
    tested?: number;
  };
  meta: {
    country: {
      code?: string;
      name?: string;
    };
    state: {
      code?: string;
      name?: string;
    };
    county: {
      code?: string;
      name?: string;
    };
    city: {
      code?: string;
      name?: string;
    };
    population?: number;
    taxonomy: TaxonomyType;
  };
  displayName: string;
  searchTokens?: string;
}

function updateQueryString(state: any) {
  const params = new URLSearchParams();
  for (const id of state.selection.regions) {
    params.append("region", id);
  }
  window.history.replaceState(
    {},
    "",
    `${document.location.pathname}?${params}${document.location.hash}`
  );
}

function parseQueryString() {
  const params = new URLSearchParams(document.location.search);
  return {
    regions: params.getAll("region"),
  };
}

function parseData(data: Array<Region>) {
  for (const region of data) {
    for (const idx in region.dates) {
      const date = region.dates[idx];
      date.date = helpers.parseDate(date.date);
    }
    region.searchTokens = generateSearchTokens(region);
  }
  return data;
}

function getLatestValue(region: Region, dataType: DataType): number | null {
  const idx = region.latest[dataType];
  if (!idx) {
    return null
  }

  return getValue(region, idx, dataType);
}

function getValue(region: Region, idx: number, dataType: DataType): number | null {
  let result = null;

  if (region.dates.length > idx && region.dates[idx].value.hasOwnProperty(dataType)) {
    result = region.dates[idx].value[dataType];
  }

  return result;
}

function sortData(data: Array<Region>, dataType: DataType) {
  data.sort((a: Region, b: Region) => {
    const valueA = getLatestValue(a, dataType);
    const valueB = getLatestValue(b, dataType);
    if (isNaN(valueA) && !isNaN(valueB)) {
      return 1;
    }
    return valueB - valueA;
  });
}

function addSearchTokensForLevel(
  tokens: Set<string>,
  region: Region,
  level: TaxonomyType
): void {
  if (region.meta[level].code !== undefined) {
    tokens.add(region.meta[level].code.toLowerCase());
    for (const token of region.meta[level].name.toLowerCase().split(" ")) {
      tokens.add(token);
    }
  }
}

function generateSearchTokens(region): string {
  let tokens: Set<string> = new Set();
  addSearchTokensForLevel(tokens, region, "country");
  addSearchTokensForLevel(tokens, region, "state");
  addSearchTokensForLevel(tokens, region, "county");
  addSearchTokensForLevel(tokens, region, "city");

  return Array.from(tokens)
    .join(" ")
    .toLowerCase();
}

function getCountNDaysAgo(
  region: Region,
  days: number,
  dataType: DataType
): number | null {
  let result = null;

  let len = region.dates.length;
  let vector = 0;
  while (vector < len && vector <= days) {
    result = len - vector;
    vector++;
  }
  return getValue(region, result, dataType);
}

function getNormalizedIndex(
  state,
  region: Region,
  value: number,
  dataType: DataType
) {
  const result = {
    firstValue: null,
    relativeZero: null,
  };
  for (let idx = 0; idx < region.dates.length; idx++) {
    const date = region.dates[idx];
    if (result.firstValue === null && date.value[dataType]) {
      result.firstValue = idx;
    }
    if (date.value[dataType] > value && idx > 0) {
      result.relativeZero = idx - 1;
      break;
    }
  }
  if (result.relativeZero === null) {
    result.relativeZero = region.dates.length - 1;
  }
  return result;
}

function getClosestRoundedNumber(input: number): number {
  const str = parseInt(input).toString();
  const digits = str.length;
  const m = Math.pow(10, digits - 1);
  return Math.floor(input / m) * m;
}

const params = parseQueryString();

export default new Vuex.Store({
  state: {
    ui: {
      view: Views.Table,
    },
    controls: {
      views: Object.keys(Views),
    },
    selection: {
      regions: params.regions,
      dataTypes: ["cases"],
      normalizationValue: null,
    },
    data: [],
  },
  getters: {
    autoNormalizedValue: (state, getters) => {
      const selectedRegions = getters.selectedRegions;
      if (selectedRegions.length == 0) {
        return null;
      }
      const dataType = state.selection.dataTypes[0];

      let earliest = [];
      for (const region of selectedRegions) {
        earliest.push(getCountNDaysAgo(region, 5, dataType));
      }


      let minValue = null;
      for (let val of earliest) {
        if (minValue === null || minValue > val) {
          minValue = val;
        }
      }
      return getClosestRoundedNumber(minValue);
    },
    normalizedIndexes: (state, getters) => {
      const result: { [key: string]: number } = {};

      const selectedRegions = getters.selectedRegions;

      if (selectedRegions.length == 0) {
        return result;
      }

      const dataType = state.selection.dataTypes[0];
      let value: number | null = state.selection.normalizationValue;

      if (state.selection.normalizationValue === null) {
        value = getters.autoNormalizedValue;
      }

      for (const region of selectedRegions) {
        result[region.id] = getNormalizedIndex(state, region, value, dataType);
      }

      return result;
    },
    selectedRegions: (state) => {
      const result: Array<Region> = [];
      for (const region of state.data) {
        if (state.selection.regions.includes(region.id)) {
          result.push(region);
        }
      }
      return result;
    },
  },
  mutations: {
    setView(state, view: Views) {
      state.ui.view = view;
    },
    setSelectedRegions(state, values) {
      state.selection.regions = values;
      updateQueryString(state);
    },
    setData(state, data) {
      const newData = data.filter((region: Region) => {
        return region.meta.taxonomy == "country";
      });

      sortData(newData, state.selection.dataTypes[0]);

      if (state.selection.regions.length === 0) {
        state.selection.regions = newData.slice(0, 8).map(region => region.id);
      }

      state.data = parseData(newData);
    },
    setDataTypes(state, dataTypes: Array<DataType>) {
      state.selection.dataTypes = dataTypes;
    },
    setNormalizationValue(state, value) {
      state.selection.normalizationValue = value;
    },
  },
  actions: {},
  modules: {},
  strict: true,
});
