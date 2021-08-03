<template>
  <div>
    <div class="banner">
      <h1>D.C. Visualize</h1>
      <h2>Power of data visualization</h2>
      <div id="map" />
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import MapboxGl from 'mapbox-gl/dist/mapbox-gl.js';

MapboxGl.accessToken = process.env.MAPBOX_API_KEY;

export default {
  components: {
  },
  data() {
    return {
      raw_dots: [[-77.5, 39.1], [-76.5, 39.5], [-77.5, 39.3]],
      container: null,
      map: null,
      svg: null,
      dots: null,
    };
  },
  computed: {
  },
  mounted() {
    this.map = new MapboxGl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v10',
      center: [-77, 38.9],
      zoom: 10,
    });
    this.container = this.map.getCanvasContainer();
    this.svg = d3
      .select(this.container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '600')
      .style('position', 'absolute')
      .style('z-index', 2);

    this.dots = this.svg
      .selectAll('circle')
      .data(this.raw_dots)
      .enter()
      .append('circle')
      .attr('r', 20)
      .style('fill', 'ff0000');
    this.map.on('viewreset', this.renderMap);
    this.map.on('move', this.renderMap);
    this.map.on('moveend', this.renderMap);
    this.renderMap();
  },
  methods: {
    project(d) {
      return this.map.project(new MapboxGl.LngLat(d[0], d[1]));
    },
    renderMap() {
      this.dots
        .attr('cx', d => this.project(d).x)
        .attr('cy', d => this.project(d).y);
    },
  },
};
</script>

<style scoped>
#map {
  position: relative;
  z-index: 0;
  width: 100%;
  height: 600px;
}
</style>



