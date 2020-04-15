<template>
  <div id="menu">
    <p class="links">
      <a href="https://github.com/zbraniecki/covid19-timeseries">Source: <img src="../assets/github.png" class="icon"/></a> |
      <a href="https://coronadatascraper.com/">Data: <img src="../assets/cds.svg" class="icon"/></a> |
      <a href="https://twitter.com/Nathan510edge">Idea: <img src="../assets/twitter.webp" class="icon"/>Nathan510edge</a>
    </p>
    <!-- <label for="presentationSelect">Presentation:</label>
    <select id="presentationSelect" v-model="presentation">
      <option v-for="presentation of presentations" :value="presentation.id">{{ presentation.name }}</option>
    </select> -->
    <label for="dataTypeSelect">Type:</label>
    <select id="dataTypeSelect" v-model="dataType">
      <option v-for="dataType of dataTypes" :value="dataType.id">
        {{ dataType.name }}
      </option>
    </select>
    <label for="dataType2Select">Per:</label>
    <select id="dataType2Select" v-model="dataType2">
      <option v-for="dataType of dataTypes2" :value="dataType.id">
        {{ dataType.name }}
      </option>
    </select>
    <label for="viewSelect">View:</label>
    <select id="viewSelect" v-model="view">
      <option v-for="view of views" :value="view.id">{{ view.name }}</option>
    </select>
    <label for="normalizeInput">Normalize:</label>
    <input
      type="text"
      :value="normalizationValue"
      v-on:change="setNormalizationValue"
      :placeholder="autoNormalizedValue"
     id="normalizeInput"
    />
    <input class="regionSearch" v-model="regionSearchText" placeholder="Search..." />
    <input class="clearRegionSearch" type="button" value="x" @click="clearSearch" />
    <select multiple @change="setSelectedRegions" class="regions" ref="regionSelect">
      <option
        v-for="region of regionList"
        :value="region.id"
        :key="region.id"
        :selected="selectedRegions.includes(region.id)"
      >{{ region.nameAndValue }}</option>
    </select>
    <template v-for="level in taxonomyLevels">
          <label :for="level.id + 'Level'">{{ level.name }}:</label>
      <input
        :id="level.id + 'Level'"
        type="checkbox"
        :checked="selectedTaxonomyLevels.includes(level.id)"
        :value="level.id"
        @change="setTaxonomyLevel"
      />
    </template>
  </div>
</template>

<script>
import helpers from "@/helpers/index.ts";
import { Presentation, DataType, View, TaxonomyLevel } from "@/types";

export default {
  name: "controls",
  data() {
    return {
      presentations: helpers.enums.entries(Presentation),
      taxonomyLevels: helpers.enums.entries(TaxonomyLevel),
      regionSearchText: "",
      dataTypes: helpers.enums
        .entries(DataType)
        .filter(pres => pres.id != "population"),
      dataTypes2: [
        {
          id: "",
          name: ""
        },
        {
          id: "population",
          name: "Population"
        }
      ],
      views: helpers.enums.entries(View)
    };
  },
  computed: {
    regionList() {
      // Could consider performing this filtering elsewhere.
      const searchQuery = this.regionSearchText.toLowerCase();
      const selection = this.$store.getters.selection;
      return this.$store.getters.sortedRegions.filter(region => helpers.isRegionIncluded(region, selection, searchQuery)).map(region => {
        let value = helpers.getLatestValue(region, selection);
        return {nameAndValue: `${region.displayName} -- ${helpers.formatValue(value, selection)}`, ...region};
      });
    },
    selectedRegions() {
      const selectedRegions = this.$store.getters.selectedRegions;
      return selectedRegions.map(region => region.id);
    },
    normalizationValue() {
      return this.$store.state.selection.normalizationValue;
    },
    autoNormalizedValue() {
      return this.$store.getters.autoNormalizedValue;
    },
    dataType: {
      get() {
        return this.$store.getters.selection.dataTypes[0];
      },
      set(value) {
        const dt = this.$store.getters.selection.dataTypes[1];
        if (dt) {
          this.$store.commit("setDataTypes", [value, dt]);
        } else {
          this.$store.commit("setDataTypes", [value]);
        }
      }
    },
    dataType2: {
      get() {
        return this.$store.getters.selection.dataTypes[1];
      },
      set(value) {
        const dt = this.$store.getters.selection.dataTypes[0];

        if (value) {
          this.$store.commit("setDataTypes", [dt, value]);
        } else {
          this.$store.commit("setDataTypes", [dt]);
        }
      }
    },
    view: {
      get() {
        return this.$store.getters.selection.view;
      },
      set(value) {
        this.$store.commit("setView", value);
      }
    },
    selectedTaxonomyLevels() {
      return this.$store.getters.selection.taxonomyLevels;
    },
    presentation: {
      get() {
        return this.$store.getters.selection.presentation;
      },
      set(value) {
        this.$store.commit("setPresentation", value);
      }
    },
  },
  methods: {
    setView(e) {
      this.$store.commit("setView", e.target.value);
    },
    setSelectedRegions(e) {
      const selectedRegionIds = this.$store.getters.selection.regions;

      const values = new Set(selectedRegionIds);
      const visibleOptions = Array.from(e.target.options).filter(option => !option.classList.contains("filtered"));
      for (const option of visibleOptions) {
        if (option.selected) {
          values.add(option.value);
        } else {
          values.delete(option.value);
        }
      }
      this.$store.commit("setSelectedRegions", Array.from(values));
    },
    setNormalizationValue(e) {
      if (e.target.value.length === 0) {
        this.$store.commit("setNormalizationValue", null);
      } else {
        const value = parseInt(e.target.value);
        this.$store.commit("setNormalizationValue", value);
      }
    },
    clearSearch(e) {
      this.regionSearchText = "";
    },
    setTaxonomyLevel(e) {
      const id = e.target.value;
      const checked = e.target.checked;
      const taxonomyLevels = Array.from(this.$store.getters.selection.taxonomyLevels);
      if (checked) {
        taxonomyLevels.push(id);
        this.$store.commit("setTaxonomyLevels", taxonomyLevels);
      } else {
        this.$store.commit("setTaxonomyLevels", taxonomyLevels.filter(l => l != id));
      }
    },
  },
  watch: {
    selectedRegions(selectedRegionIds) {
      const select = this.$refs["regionSelect"];
      for (let option of select.options) {
        option.selected = selectedRegionIds.includes(option.value);
      }
    },
  },
};
</script>

<style scoped>
#menu {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  grid-template-rows: auto;
  grid-column-gap: 0px;
  grid-row-gap: 2px;
  padding: 5px;
}

select, input {
  grid-column: 2 / 4;
}

input[type=checkbox] {
  grid-column: 3 / 4;
}

label {
  grid-column: 1 / 2;
}

.regionSearch {
  grid-column: 1 / 3;
}

.clearRegionSearch {
  grid-column: 3 / 4;
}

select.regions {
  grid-column: 1 / 4;
  height: 60vh;
}

p.links {
  grid-column: 1 / 4;
  font-size: 0.7em;
  text-align: center;
  border-bottom: 1px solid #999999;
  padding-bottom: 5px;
}

p.links a {
  text-decoration: none;
}

img.icon {
  height: 14px;
  vertical-align: middle;
}
</style>
