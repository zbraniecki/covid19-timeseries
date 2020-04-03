import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

enum Views {
  Table = "Table",
  Chart = "Chart",
};

export default new Vuex.Store({
  state: {
    ui: {
      view: Views.Table
    },
    controls: {
      views: Object.keys(Views)
    }
  },
  mutations: {
    setView (state, view: Views) {
      state.ui.view = view;
    }
  },
  actions: {},
  modules: {},
  strict: true
});
