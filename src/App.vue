<template>
  <div class="app">
    <div class="banner">
      <div class="header">
        <h1>D.C. Collisions</h1>
        <h2>Frequency of car incidents in District Columbia within 2010-2014 range</h2>
      </div>
      <div class="filter">
        <template
          v-for="mode in modes"
          :key="mode"
        >
          <input :id="mode" v-model="pickedMode" type="radio" :value="mode">
          <label :for="mode" :class="{ active: mode === pickedMode }">{{ mode }}</label>
        </template>
      </div>

      <div id="legend" class="legend">
        <template
          v-for="(value, index) in quartiles"
          :key="value"
        >
          <div :style="{ background: quartileColorStyle(index) }" class="legend-bubble">
            {{ value }}
          </div>
        </template>
      </div>
    </div>
    <div id="details" ref="details" v-show="pickedCounty">
      <div class="close" @click="pickedCounty = null">X</div>
      <h2>{{ pickedCounty && pickedCounty.name }}</h2>
      <div>Total accidents: <strong>{{pickedCounty && pickedCounty.total}}</strong></div>
      <div>Area: <strong>{{pickedCounty && pickedCounty.shape_area / 1000000}}</strong> </div>
      <div id="diagram" ref="diagram" />
    </div>
    <div id="map" />
  </div>
</template>

<script>
import * as d3 from 'd3';
import MapboxGl from 'mapbox-gl/dist/mapbox-gl.js';
import GeoData from '../data/annotatedData.geo';

const modes = ['total', '2010', '2011', '2012', '2013', '2014'];

/* normalize the data: replace nulls with zeroes */
GeoData.features = GeoData.features.map(({ properties, ...item }) => {
  modes.forEach((name) => {
    properties[name] = properties[name] || 0; // eslint-disable-line no-param-reassign
  });
  return { properties, ...item };
});

MapboxGl.accessToken = process.env.MAPBOX_API_KEY;

export default {
  components: {
  },
  data() {
    return {
      modes,
      pickedMode: 'total',
      pickedCounty: null,
      map: null,
      diagram: null,
      xAxis: null,
      yAxis: null,
      bars: null,
      labels: null,
    };
  },
  computed: {
    isTotal() {
      return this.pickedMode === 'total';
    },
    quartileThreshold() {
      return (n) => {
        if (n === 0) return 0;
        if (n === 1) return this.isTotal ? 3 : 2;
        if (n === 2) return this.isTotal ? 16 : 5;
        return this.isTotal ? 40 : 12;
      };
    },
    quartileColorStyle() {
      return (n) => {
        if (n === 0) return 'rgba(0,0,0,.2)';
        if (n === 1) return 'rgba(120,0,0,.3)';
        if (n === 2) return 'rgba(255,0,0,.4)';
        return 'rgba(255,255,0,.5)';
      };
    },
    quartiles() {
      return [0, this.quartileThreshold(1), this.quartileThreshold(2), this.quartileThreshold(3)];
    },
  },
  watch: {
    pickedMode: {
      immediate: true,
      handler(pickedMode) {
        this.setMapLayer(pickedMode);
      },
    },
    pickedCounty: {
      handler(pickedCounty) {
        this.detailsDiagram(pickedCounty);
      },
    },
  },
  mounted() {
    this.map = new MapboxGl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v10',
      center: [-77, 38.9],
      zoom: 11,
      maxBounds: [
        [-77.4, 38.7],
        [-76.6, 39.1],
      ],
    });

    this.map.on('load', () => {
      this.map.addSource('accidents', {
        type: 'geojson',
        data: GeoData,
      });
      this.setMapLayer(this.pickedMode);

      // When a click event occurs on a feature in the counties layer, open a popup at the
      // location of the feature, with description HTML from its properties.
      this.map.on('click', 'counties', (e) => {
        this.pickedCounty = e.features[0].properties;
      });

      // Change the cursor to a pointer when the mouse is over the counties layer.
      this.map.on('mouseenter', 'counties', () => {
        this.map.getCanvas().style.cursor = 'pointer';
      });

      // Change it back to a pointer when it leaves.
      this.map.on('mouseleave', 'counties', () => {
        this.map.getCanvas().style.cursor = '';
      });
    });
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
    setMapLayer(mode) {
      if (!this.map) return;
      if (this.map.getLayer('counties')) this.map.removeLayer('counties');
      this.map.addLayer({
        id: 'counties',
        type: 'fill',
        source: 'accidents',
        paint: {
          'fill-outline-color': 'rgba(160,160,160,.3)',
          'fill-color': [
            'interpolate',
            ['linear'],
            ['/', ['get', mode], ['/', ['get', 'shape_area'], ['literal', 1000000]]],
            0,
            this.quartileColorStyle(0),
            this.quartileThreshold(1),
            this.quartileColorStyle(1),
            this.quartileThreshold(2),
            this.quartileColorStyle(2),
            this.quartileThreshold(3),
            this.quartileColorStyle(3),
          ],
        },
      });
    },
    detailsDiagram(county) {
      if (!county) return;
      const margin = { top: 30, right: 0, bottom: 10, left: 30 };
      const data = this.modes
        .filter(mode => mode !== 'total')
        .map(name => ({ name, value: county[name] }));

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
body { margin: 0; padding: 0; }
#map { position: absolute; top: 0; bottom: 0; width: 100%; }

.map-overlay {
  position: absolute;
  top: 0;
  left: 0;
  padding: 10px;
}
.banner {
  position: absolute;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 1;
}
.header {
  position: absolute;
  top: 20px;
  left: 20px;
}
.header h1, .header h2 {
  margin: 0;
}
.header h1 {
  font-size: 2em;
}
.header h2 {
  font-size: 1em;
  font-weight: normal;
}
.filter {
  position: absolute;
  top: 20px;
  right: 20px;
}
.filter input[type=radio] {
  display: none;
}
.filter label {
  display: inline-block;
  border: solid 1px #000;
  background: #fff;
  padding: 2px 5px;
  cursor: pointer;
  text-transform: uppercase;
}
.filter label:hover {
  background: #ddd;
}

.filter label.active {
  color: #900;
  font-weight: bold;
}

.legend {
  position: absolute;
  left: 20px;
  top: 100px;
  width: 50%;
}
.legend-bubble {
  display: inline-block;
  margin: 0;
  border: solid 1px rgba(160,160,160,.3);
  border-radius: 50%;
  padding: 12px;
  width: 15px;
  height: 15px;
  text-align: center;
}

.legend-bubble + .legend-bubble {
  margin-left: 15px;
}
#details {
  position: absolute;
  background: #fff;
  border: solid 1px #000;
  right: 30px;
  top: 80px;
  bottom: 50px;
  z-index: 3;
  width: 40%;
}
#details .close {
  position: absolute;
  right: 10px;
  top: 10px;
  width: 10px;
  height: 10px;
}
</style>
