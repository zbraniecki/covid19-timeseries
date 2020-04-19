import Vue from "vue";
import Vuex from "vuex";
import helpers from "@/helpers/index.ts";
import {
  Selection,
  Region,
  Presentation,
  DataType,
  Regions,
  RegionList,
  View,
  State,
  SelectionInput,
  TaxonomyLevel
} from "@/types";

let DATASET: Regions = {};

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
  if (state.selection.normalizationValue) {
    params.set("normalize", state.selection.normalizationValue);
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
  const normalizationValue = params.get("normalize") as number | null;
  const presentation = params.get("presentation");
  return {
    presentation: helpers.enums.get(Presentation, presentation),
    regions: params.getAll("region"),
    dataTypes,
    view,
    normalizationValue,
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
    normalizationValue: state.selection.normalizationValue,
    taxonomyLevels: state.selection.taxonomyLevels,
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
      normalizationValue: params.normalizationValue,
      view: params.view,
      taxonomyLevels: [TaxonomyLevel.Country],
    },
    sortedRegionIds: [],
    loadedTaxonomies: new Set<TaxonomyLevel>(),
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
    selectedRegions(state: State, getters): RegionList {
      const result: RegionList = [];

      const selection = getters.selection;
      let selectedRegionIds = selection.regions;
      const sortedRegions = getters.sortedRegions;

      if (selectedRegionIds.length === 0) {

        const filteredRegions = sortedRegions.filter((region: Region) => helpers.isRegionIncluded(region, selection, "")).slice(0, 7);
        for (const region of filteredRegions) {
          result.push(region);
        }
      } else {
        for (const region of sortedRegions) {
          if (selectedRegionIds.includes(region.id)) {
            result.push(region);
          }
        }  
      }
      return result;
    },
    selection(state) {
      return getSelection(state);
    },
    sortedRegions(state: State): RegionList {
      const result: RegionList = [];

      let sortedRegionIds = state.sortedRegionIds;

      for (const regionId of sortedRegionIds) {
        let region: Region | undefined = DATASET[regionId];
        if (region !== undefined) {
          result.push(region);
        }
      }

      return result;
    },
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
      for (let id in data) {
        DATASET[id] = data[id];
        helpers.parseData(DATASET[id]);
      }
      const regionIds = Object
        .values(DATASET)
        .map((region: Region) => region.id);

      const selection = getSelection(state);
      helpers.sortData(DATASET, regionIds, selection);
      state.sortedRegionIds = regionIds;
    },
    setDataTypes(state, dataTypes: Array<DataType>) {
      state.selection.dataTypes = dataTypes;

      const selection = getSelection(state);
      helpers.sortData(DATASET, state.sortedRegionIds, selection);

      updateQueryString(state);
    },
    setNormalizationValue(state, value) {
      state.selection.normalizationValue = value;
      updateQueryString(state);
    },
    setView(state, value) {
      state.selection.view = value;
      updateQueryString(state);
    },
    setTaxonomyLevels(state, value) {
      state.selection.taxonomyLevels = value;
    },
  },
  actions: {
    async loadData({ commit, state }, taxonomy: TaxonomyLevel) {
      if (state.loadedTaxonomies.has(taxonomy)) {
        return;
      }
      const key: string = helpers.enums.getKey(taxonomy);
      const data = await fetch(
        `${__webpack_public_path__}timeseries-${key}.json`
      );
      const json = await data.json();
      commit("setData", json);
      state.loadedTaxonomies.add(taxonomy);
    },
    async setTaxonomyLevels(ctx, value) {
      for (let level of value) {
        await ctx.dispatch("loadData", level);
      }
      ctx.commit("setTaxonomyLevels", value);
    }
  },
  modules: {},
  strict: true
});
