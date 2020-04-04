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

function filterData(data) {
  const sorted = data.sort((a: any, b: any) => {
    const casesA = a.dates[a.latest["cases"]].value["cases"];
    const casesB = b.dates[b.latest["cases"]].value["cases"];
    return casesB - casesA;
  });
  for (let region of sorted) {
    for (const idx in region.dates) {
      let date = region.dates[idx];
      date.date = new Date(date.date);
    }
  }
  return data;
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
      let newData = data.filter((region: any) => {
        return region.meta.taxonomy == "country";
      });

      state.data = filterData(newData);
    }
  },
  actions: {},
  modules: {},
  strict: true
});
