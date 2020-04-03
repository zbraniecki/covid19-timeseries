import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

enum Views {
  Table = "Table",
  Chart = "Chart"
}

function updateQueryString(state) {
  const params = new URLSearchParams();
  for (const id of state.selection.regions) {
    params.append("region", id);
  }
  window.history.replaceState({}, '', `${document.location.pathname}?${params}`);
}

const data = [
  {
    id: "usa",
    dates: [],
    displayName: "USA",
    meta: {
      country: {
        id: "usa",
        name: "United States"
      }
    }
  },
  {
    id: "ita",
    dates: [],
    displayName: "Italy",
    meta: {
      country: {
        id: "ita",
        name: "Italy"
      }
    }
  },
];

export default new Vuex.Store({
  state: {
    ui: {
      view: Views.Table
    },
    controls: {
      views: Object.keys(Views)
    },
    selection: {
      regions: []
    },
    data
  },
  mutations: {
    setView(state, view: Views) {
      state.ui.view = view;
    },
    setSelectedRegions(state, values) {
      state.selection.regions = values;
      updateQueryString(state);
    },
  },
  actions: {},
  modules: {},
  strict: true
});
