<template>
  <svg id="chartSvg" width="100%" height="100%" />
</template>

<script>
import * as d3 from "d3";
import { mapState } from "vuex";

export default {
  name: "chart",
  computed: {
    selectedRegions() {
      return this.$store.getters.selectedRegions;
    },
    ...mapState(["data"])
  },
  mounted() {
    const selected = this.$store.getters.selectedRegions;
    let result = selected[0];
    if (result) {
      this.draw(result);
    }
  },
  watch: {
    selectedRegions(newValue) {
      const selected = this.$store.getters.selectedRegions;
      let result = selected[0];
      if (result) {
        this.draw(result);
      }
    },
    data(newValue) {
      let data = newValue;
      if (!data.length) {
        return;
      }
      data = data[0];
      if (data) {
        this.draw(data);
      }
    }
  },
  methods: {
    draw(region) {
      const height = 500;
      const width = 500;
      const margin = { top: 20, right: 30, bottom: 30, left: 60 };
      const dataType = this.$store.getters.selection.dataTypes[0];

      const svg = d3.select("#chart");
      svg.selectAll("*").remove();
      svg.attr("viewBox", [0, 0, width, height]);

      const x = d3
        .scaleUtc()
        .domain(d3.extent(region.dates, d => new Date(d.date)))
        .range([margin.left, width - margin.right]);
      const y = d3
        .scaleLinear()
        .domain([0, d3.max(region.dates, d => d.value[dataType])])
        .nice()
        .range([height - margin.bottom, margin.top]);

      const xAxis = g =>
        g.attr("transform", `translate(0,${height - margin.bottom})`).call(
          d3
            .axisBottom(x)
            .ticks(width / 80)
            .tickSizeOuter(0)
        );
      const yAxis = g =>
        g
          .attr("transform", `translate(${margin.left},0)`)
          .call(d3.axisLeft(y))
          .call(g => g.select(".domain").remove());
      const line = d3
        .line()
        .defined(d => !isNaN(d.value[dataType]))
        .x(d => x(new Date(d.date)))
        .y(d => y(d.value[dataType]));
      svg.append("g").call(xAxis);
      svg.append("g").call(yAxis);
      svg
        .append("path")
        .datum(region.dates)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line);
    }
  }
};
</script>

<style scoped></style>
