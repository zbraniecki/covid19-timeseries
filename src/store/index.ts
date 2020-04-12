import Vue from "vue";
import Vuex from "vuex";
import helpers from "@/helpers/index.ts";
import {
  Selection,
  Region,
  Presentation,
  DataType,
  View,
  State,
  SelectionInput
} from "@/types";

Vue.use(Vuex);

function updateQueryString(state: any) {
  const params = new URLSearchParams();
  for (const id of state.selection.regions) {
    params.append("region", id);
  }
  for (const dataType of state.selection.dataTypes) {
    if (dataType) {
      params.append("dataType", dataType);
    }
  }
  if (state.selection.view) {
    params.set("view", state.selection.view);
  }
  window.history.replaceState(
    {},
    "",
    `${document.location.pathname}?${params}${document.location.hash}`
  );
}

function getUserPreferences(): SelectionInput {
  const params = new URLSearchParams(document.location.search);
  const dataTypes = params.getAll("dataType") as Array<DataType>;
  const view = params.get("view") as View | null;
  const presentation = params.get("presentation");
  return {
    presentation: helpers.enums.get(Presentation, presentation),
    regions: params.getAll("region"),
    dataTypes,
    view,
    normalizationValue: null
  };
}

function getSelection(state: State): Selection {
  return {
    presentation: state.selection.presentation || Presentation.Table,
    dataTypes:
      state.selection.dataTypes.length > 0
        ? state.selection.dataTypes
        : [DataType.Cases],
    view: state.selection.view || View.Total,
    regions: state.selection.regions.length > 0 ? state.selection.regions : [],
    normalizationValue: state.selection.normalizationValue
  };
}

const params = getUserPreferences();

export default new Vuex.Store({
  state: {
    controls: {
      views: helpers.enums.values(Presentation)
    },
    selection: {
      presentation: params.presentation,
      regions: params.regions,
      dataTypes: params.dataTypes,
      normalizationValue: null,
      view: params.view
    },
    data: []
  },
  getters: {
    autoNormalizedValue(state: State, getters): number {
      const selectedRegions = getters.selectedRegions;
      if (selectedRegions.length == 0) {
        return 0;
      }

      const selection = helpers.getSelectionForView(
        getters.selection,
        View.Total
      );
      const earliest = [];
      for (const region of selectedRegions) {
        earliest.push(helpers.getCountNDaysSinceTheLast(region, 5, selection));
      }

      let minValue = null;
      for (const val of earliest) {
        if (val !== null && (minValue === null || minValue > val)) {
          minValue = val;
        }
      }

      return helpers.getClosestRoundedNumber(minValue);
    },
    normalizedIndexes(state, getters) {
      const result: {
        [key: string]: {
          firstValue: number | null;
          relativeZero: number | null;
        };
      } = {};

      const selectedRegions = getters.selectedRegions;

      if (selectedRegions.length == 0) {
        return result;
      }

      let value: number | null = state.selection.normalizationValue;

      if (value === null) {
        value = getters.autoNormalizedValue;
      }

      const selection = helpers.getSelectionForView(
        getters.selection,
        View.Total
      );
      for (const region of selectedRegions) {
        result[region.id] = helpers.getNormalizedIndex(
          state,
          region,
          value as number,
          selection
        );
      }

      return result;
    },
    selectedRegions(state: State, getters): Array<Region> {
      const regions = getters.selection.regions;
      if (regions.length === 0) {
        return state.data.slice(0, 8);
      }
      const result: Array<Region> = [];

      for (const region of state.data) {
        if (regions.includes(region.id)) {
          result.push(region);
        }
      }

      return result;
    },
    selection(state) {
      const x = getSelection(state);
      return x;
    }
  },
  mutations: {
    setPresentation(state, presentation: Presentation) {
      state.selection.presentation = presentation;
    },
    setSelectedRegions(state, values) {
      state.selection.regions = values;
      updateQueryString(state);
    },
    setData(state, data) {
      const newData = data.filter((region: Region) => {
        return region.meta.taxonomy == "country";
      });

      const selection = getSelection(state);

      helpers.sortData(newData, selection);

      state.data = helpers.parseData(newData);
    },
    setDataTypes(state, dataTypes: Array<DataType>) {
      state.selection.dataTypes = dataTypes;

      {
        const selection = getSelection(state);
        helpers.sortData(state.data, selection);
      }

      updateQueryString(state);
    },
    setNormalizationValue(state, value) {
      state.selection.normalizationValue = value;
    },
    setView(state, value) {
      state.selection.view = value;
      updateQueryString(state);
    }
  },
  actions: {},
  modules: {},
  strict: true
});
