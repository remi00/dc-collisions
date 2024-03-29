<template>
  <div id="diagram" ref="diagram" />
</template>

<script>
import * as d3 from 'd3';

export default {
  props: {
    series: {
      type: Array,
      default: () => [],
    },
    color: {
      type: String,
      default: 'silver',
    },
    xMax: {
      type: Number,
      default: 0,
    },
    chartMargins: {
      type: Object,
      default: () => ({
        top: 30,
        right: 0,
        bottom: 10,
        left: 30,
      }),
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
  watch: {
    series: {
      immediate: true,
      handler() {
        this.detailsDiagram(this.series);
      },
    },
  },
  mounted() {
    this.diagram = d3.select(this.$refs.diagram)
      .append('svg')
      .attr('viewBox', [0, 0, 240, 180]);

    this.bars = this.diagram.append('g')
      .attr('fill', this.color);
    this.labels = this.diagram.append('g')
      .attr('fill', 'gray')
      .attr('text-anchor', 'start')
      .attr('font-size', 10);
    this.xAxis = this.diagram
      .append('g')
      .attr('transform', `translate(0,${this.chartMargins.top})`);
    this.yAxis = this.diagram.append('g')
      .attr('transform', `translate(${this.chartMargins.left},0)`);
  },
  methods: {
    detailsDiagram(data) {
      if (!data || !data.length) return;

      const width = 200;
      const barHeight = 25;
      const height = Math.ceil((data.length + 0.1) * barHeight)
        + this.chartMargins.top
        + this.chartMargins.bottom;

      const x = d3.scaleLinear()
        .domain([0, this.xMax || d3.max(data, d => d.value)])
        .range([this.chartMargins.left, width - this.chartMargins.right]);
      const y = d3.scaleBand()
        .domain(d3.range(data.length))
        .rangeRound([this.chartMargins.top, height - this.chartMargins.bottom])
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
        .attr('dy', '0.25em')
        .attr('dx', 5)
        .text(d => Number(d.value).toFixed(1));

      this.xAxis.call(g => g
        .call(d3
          .axisTop(x)
          .ticks(width / 50)));
      this.yAxis.call(g => g
        .call(d3
          .axisLeft(y)
          .tickFormat(i => data[i].name)
          .tickSizeOuter(0)));
    },
  },
};
</script>
