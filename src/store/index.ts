import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

enum Views {
  Table = "Table",
  Chart = "Chart"
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
    regions: params.getAll("region")
  };
}

function filterData(data) {
  const sorted = data.sort((a: any, b: any) => {
    const casesA = a.dates[a.latest["cases"]].value["cases"];
    const casesB = b.dates[b.latest["cases"]].value["cases"];
    return casesB - casesA;
  });
  for (const region of sorted) {
    for (const idx in region.dates) {
      const date = region.dates[idx];
      date.date = new Date(date.date);
    }
  }
  return data;
}

function getNormalizedIndex(state, region) {
  const type = "cases";
  const value = 1000;
  if (!state.normalization[region.id]) {
    state.normalization[region.id] = {};
  }
  if (!state.normalization[region.id][type]) {
    const result = {
      firstValue: null,
      relativeZero: null
    };
    for (let idx = 0; idx < region.dates.length; idx++) {
      const date = region.dates[idx];
      if (result.firstValue === null && date.value[type]) {
        result.firstValue = idx;
      }
      if (date.value[type] > value && idx > 0) {
        result.relativeZero = idx - 1;
        break;
      }
    }
    if (result.relativeZero === null) {
      result.relativeZero = region.dates.length - 1;
    }
    state.normalization[region.id][type] = result;
  }
  return state.normalization[region.id][type];
}

const params = parseQueryString();

export default new Vuex.Store({
  state: {
    ui: {
      view: Views.Table
    },
    controls: {
      views: Object.keys(Views)
    },
    selection: {
      regions: params.regions
    },
    data: [],
    normalization: {}
  },
  getters: {
    normalizedIndexes: (state, getters) => {
      const selectedRegions = getters.selectedRegions;
      const result = {};
      for (const region of selectedRegions) {
        result[region.id] = getNormalizedIndex(state, region);
      }
      return result;
    },
    selectedRegions: state => {
      const result = [];
      for (const region of state.data) {
        if (state.selection.regions.includes(region.id)) {
          result.push(region);
        }
      }
      return result;
    }
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
      const newData = data.filter((region: any) => {
        return region.meta.taxonomy == "country";
      });

      state.data = filterData(newData);
    }
  },
  actions: {},
  modules: {},
  strict: true
});
