<template>
  <div id="menu">
    <div>
      <label>Presentation:</label>
      <select v-model="presentation">
        <option
          v-for="presentation of presentations"
          :value="presentation.id"
        >{{ presentation.name }}</option>
      </select>
    </div>
    <div>
      <label>Type:</label>
      <select v-model="dataType">
        <option v-for="dataType of dataTypes" :value="dataType.id">
          {{
          dataType.name
          }}
        </option>
      </select>
    </div>
    <div>
      <label>Per:</label>
      <select v-model="dataType2">
        <option v-for="dataType of dataTypes2" :value="dataType.id">
          {{
          dataType.name
          }}
        </option>
      </select>
    </div>
    <div>
      <label>View:</label>
      <select v-model="view">
        <option v-for="view of views" :value="view.id">{{ view.name }}</option>
      </select>
    </div>
    <div>
      <label>Normalize:</label>
      <input
        type="text"
        :value="normalizationValue"
        v-on:change="setNormalizationValue"
        :placeholder="autoNormalizedValue"
      />
    </div>
    <div>
      <input v-model="regionSearchText" placeholder="Search..." />
      <input type="button" value="x" @click="clearSearch"/>
      <select multiple @change="setSelectedRegions" class="regions" ref="regionSelect">
        <option
          v-for="region of regionList"
          :value="region.id"
          :key="region.id"
          :selected="selectedRegions.includes(region.id)"
          :class="{ filtered: region.filtered }"
        >{{ region.displayName }}</option>
      </select>
    </div>
  </div>
</template>

<script>
import helpers from "@/helpers/index.ts";
import { Presentation, DataType, View } from "@/types";

export default {
  name: "controls",
  data() {
    return {
      presentations: helpers.enums.entries(Presentation),
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
      const result = [];
      const searchQuery = this.regionSearchText.toLowerCase();

      const included = region => {
        if (searchQuery.length === 0) {
          return true;
        }
        return region.searchTokens.includes(searchQuery);
      };

      for (const region of this.$store.getters.sortedRegions) {
        result.push({
          id: region.id,
          displayName: region.displayName,
          filtered: !included(region)
        });
      }
      return result;
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
    presentation: {
      get() {
        return this.$store.getters.selection.presentation;
      },
      set(value) {
        this.$store.commit("setPresentation", value);
      }
    }
  },
  methods: {
    setView(e) {
      this.$store.commit("setView", e.target.value);
    },
    setSelectedRegions(e) {
      const selectedRegionIds = this.$store.getters.selection.regions;
      const searchQuery = this.regionSearchText.toLowerCase();

      if (searchQuery.length) {
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
      } else {
        const values = Array.from(e.target.selectedOptions).map(v => v.value);
        this.$store.commit("setSelectedRegions", Array.from(values));
      }
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
  display: flex;
  flex-direction: column;
}
select.regions {
  width: 100%;
}

select.regions {
  height: 60vh;
}

select .filtered {
  display: none;
}
</style>
