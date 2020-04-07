<template>
  <div id="menu">
    <select @change="setView">
      <option
        v-for="item of viewList"
        :key="item"
        :value="item"
        :selected="selectedView == item"
      >
        {{ item }}
      </option>
    </select>
    <label>Normalize:</label>
    <input type="text" :value="normalizationValue" v-on:change="setNormalizationValue"></input>
    <input v-model="regionSearchText" placeholder="Search..." />
    <select multiple @change="setSelectedRegions" class="regions">
      <option
        v-for="region of regionList"
        :key="region.id"
        :value="region.id"
        :selected="selectedRegions.includes(region.id)"
        :class="{ filtered: region.filtered }"
      >
        {{ region.displayName }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: "controls",
  data() {
    return {
      regionSearchText: ""
    }
  },
  computed: {
    viewList() {
      return Object.values(this.$store.state.controls.views);
    },
    regionList() {
      // Could consider performing this filtering elsewhere.
      const result = [];
      const searchQuery = this.regionSearchText.toLowerCase();

      let included = region => {
        if (searchQuery.length === 0) {
          return true;
        }
        return region.displayName.toLowerCase().includes(searchQuery);
      }

      for (let region of this.$store.state.data) {
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
    setRegionSearchText(e) {
      const searchText = e.target.value.toLowerCase();
      this.$store.commit("setRegionSearchText", searchText);
    },
    setNormalizationValue(e) {
      const value = parseInt(e.target.value);
      this.$store.commit("setNormalizationValue", value);
    },
  }
};
</script>

<style scoped>
select {
  width: 100%;
}

select.regions {
  height: 60vh;
}

select .filtered {
  display: none;
}
</style>
