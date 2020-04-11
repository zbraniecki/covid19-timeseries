<template>
  <div id="menu">
    <div>
      <label>View:</label>
      <select @change="setView">
        <option
          v-for="item of viewList"
          :key="item"
          :value="item"
          :selected="selectedView == item"
        >{{ item }}</option>
      </select>
    </div>
    <div>
      <label>Type:</label>
      <select v-model="dataType">
        <option v-for="dataType of dataTypes" :value="dataType.id">{{ dataType.name }}</option>
      </select>
    </div>
    <div>
      <label>Per:</label>
      <select v-model="dataType2">
        <option v-for="dataType of dataTypes2" :value="dataType.id">{{ dataType.name }}</option>
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
      <select multiple @change="setSelectedRegions" class="regions">
        <option
          v-for="region of regionList"
          :key="region.id"
          :value="region.id"
          :selected="selectedRegions.includes(region.id)"
          :class="{ filtered: region.filtered }"
        >{{ region.displayName }}</option>
      </select>
    </div>
  </div>
</template>

<script>
export default {
  name: "controls",
  data() {
    return {
      regionSearchText: "",
      dataTypes: [
        {
          id: "cases",
          name: "Cases"
        },
        {
          id: "deaths",
          name: "Deaths"
        },
        {
          id: "active",
          name: "Active"
        },
        {
          id: "tested",
          name: "Tested"
        }
      ],
      dataTypes2: [
        {
          id: "",
          name: "",
        },
        {
          id: "population",
          name: "Population",
        }
      ]
    };
  },
  computed: {
    viewList() {
      return Object.values(this.$store.state.controls.views);
    },
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

      for (const region of this.$store.state.data) {
        result.push({
          id: region.id,
          displayName: region.displayName,
          filtered: !included(region)
        });
      }
      return result;
    },
    selectedView() {
      return this.$store.state.ui.view;
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
        return this.$store.getters.dataTypes[0];
      },
      set(value) {
        this.$store.commit("setDataTypes", [value]);
      }
    },
    dataType2: {
      get() {
        return this.$store.getters.dataTypes[1];
      },
      set(value) {
        let dt = this.$store.getters.dataTypes[0];
        this.$store.commit("setDataTypes", [dt, value]);
      }
    }
  },
  methods: {
    setView(e) {
      this.$store.commit("setView", e.target.value);
    },
    setSelectedRegions(e) {
      const values = Array.from(e.target.selectedOptions).map(v => v.value);
      this.$store.commit("setSelectedRegions", values);
    },
    setNormalizationValue(e) {
      if (e.target.value.length === 0) {
        this.$store.commit("setNormalizationValue", null);
      } else {
        const value = parseInt(e.target.value);
        this.$store.commit("setNormalizationValue", value);
      }
    }
  }
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
