<template>
  <svg id="chartSvg" />
</template>

<script>
import * as d3 from "d3";
import { mapState } from "vuex";

export default {
  name: "chart",
  computed: {
    selectedRegions() {
      return this.$store.state.selection.regions;
    },
    ...mapState(["data"])
  },
  mounted() {
    let result = null;
    const selected = this.$store.state.selection.regions;
    for (const region of this.$store.state.data) {
      if (region.id == selected[0]) {
        result = region;
      }
    }
    if (result) {
      this.draw(result);
    }
  },
  watch: {
    selectedRegions(newValue) {
      let result = null;
      for (const region of this.$store.state.data) {
        if (region.id == newValue[0]) {
          result = region;
        }
      }
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

      const svg = d3.select("#chart");
      svg.selectAll("*").remove();
      svg.attr("viewBox", [0, 0, width, height]);

      const x = d3
        .scaleUtc()
        .domain(d3.extent(region.dates, d => d3.utcParse("%Y-%m-%d")(d.date)))
        .range([margin.left, width - margin.right]);
      const y = d3
        .scaleLinear()
        .domain([0, d3.max(region.dates, d => d.value["cases"])])
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
        .defined(d => !isNaN(d.value["cases"]))
        .x(d => x(d3.utcParse("%Y-%m-%d")(d.date)))
        .y(d => y(d.value["cases"]));
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
