<template>
  <div class="details">
    <div class="close" @click="$emit('close')">X</div>
    <div class="contents">
      <h2>{{ label }}</h2>
      <p v-if="subtitle">{{subtitle}}</p>
      <div v-show="isEmpty">No accidents in this area</div>
      <div id="diagram" v-show="!isEmpty" ref="diagram" />
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  props: {
    label: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },
    chartData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      diagram: null,
      bars: null,
      labels: null,
      xAxis: null,
      yAxis: null,
    };
  },
  computed: {
    isEmpty() {
      return !this.chartData || !this.chartData.length;
    },
  },
  watch: {
    chartData: {
      immediate: true,
      handler() {
        this.detailsDiagram(this.chartData);
      },
    },
  },
  mounted() {
    this.diagram = d3.select(this.$refs.diagram)
      .append('svg')
      .attr('viewBox', [0, 0, '100%', '100%']);
    this.bars = this.diagram.append('g')
      .attr('fill', 'steelblue');
    this.labels = this.diagram.append('g')
      .attr('fill', 'white')
      .attr('text-anchor', 'end')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 12);
    this.xAxis = this.diagram.append('g');
    this.yAxis = this.diagram.append('g');
  },
  methods: {
    detailsDiagram(data) {
      if (!data || !data.length) return;

      const margin = { top: 30, right: 0, bottom: 10, left: 30 };
      const width = 200;
      const barHeight = 25;
      const height = Math.ceil((data.length + 0.1) * barHeight) + margin.top + margin.bottom;

      const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .range([margin.left, width - margin.right]);
      const y = d3.scaleBand()
        .domain(d3.range(data.length))
        .rangeRound([margin.top, height - margin.bottom])
        .padding(0.1);

      this.bars
        .selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', x(0))
        .attr('y', (d, i) => y(i))
        .attr('width', d => x(d.value) - x(0))
        .attr('height', y.bandwidth());

      this.labels
        .selectAll('text')
        .data(data)
        .join('text')
        .attr('x', d => x(d.value))
        .attr('y', (d, i) => y(i) + y.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('dx', -4)
        .text(d => d.value)
        .call(text => text.filter(d => x(d.value) - x(0) < 20) // short bars
          .attr('dx', +4)
          .attr('fill', 'black')
          .attr('text-anchor', 'start'));

      this.xAxis.call(g => g
        .attr('transform', `translate(0,${margin.top})`)
        .call(d3.axisTop(x).ticks(width / 80))
        .call(g => g.select('.domain').remove()));

      this.yAxis.call(g => g
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).tickFormat(i => data[i].name).tickSizeOuter(0)));
    },
  },
};
</script>

<style scoped>
.close {
  position: absolute;
  right: 10px;
  top: 10px;
  width: 10px;
  height: 10px;
}
</style>
