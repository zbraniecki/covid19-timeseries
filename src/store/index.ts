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

function getLatestValue(region: Region, dataType: DataType) {
  if (!region.latest[dataType]) {
    return undefined;
  }
  return region.dates[region.latest[dataType]].value[dataType];
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

function addSearchTokensForLevel(tokens: Set<string>, region: Region, level: TaxonomyType): void {
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

  return Array.from(tokens).join(" ").toLowerCase();
}

function getNormalizedIndex(state, region: Region) {
  const dataType = state.selection.dataTypes[0];
  const value = state.selection.normalizationValue;

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

const params = parseQueryString();

export default new Vuex.Store({
  state: {
    ui: {
      view: Views.Table,
    },
    controls: {
      views: Object.keys(Views),
      regionSearchText: "",
    },
    selection: {
      regions: params.regions,
      dataTypes: ["cases"],
      normalizationValue: 2000,
    },
    data: [],
  },
  getters: {
    normalizedIndexes: (state, getters) => {
      const selectedRegions = getters.selectedRegions;
      const result: { [key: string]: number } = {};
      for (const region of selectedRegions) {
        result[region.id] = getNormalizedIndex(state, region);
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
    setRegionSearchText(state, regionSearchText) {
      state.controls.regionSearchText = regionSearchText;
    },
    setData(state, data) {
      const newData = data.filter((region: Region) => {
        return region.meta.taxonomy == "country";
      });

      sortData(newData, state.selection.dataTypes[0]);
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
