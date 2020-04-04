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
    `${document.location.pathname}?${params}`
  );
}

function parseQueryString() {
  const params = new URLSearchParams(document.location.search);
  return {
    regions: params.getAll("region")
  };
}

function filterData(state: any) {
  const sorted = state.data.sort((a: any, b: any) => {
    const casesA = a.dates[a.latest["cases"]].value["cases"];
    const casesB = b.dates[b.latest["cases"]].value["cases"];
    return casesB - casesA;
  });
  state.data = sorted;
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
    data: []
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
      state.data = data.filter((region: any) => {
        return region.meta.taxonomy == "country";
      });

      filterData(state);
    }
  },
  actions: {},
  modules: {},
  strict: true
});
