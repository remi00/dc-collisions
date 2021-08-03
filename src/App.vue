<template>
  <div class="app">
    <div class="banner">
      <div class="header">
        <h1>D.C. Collisions</h1>
        <h2>Frequency of car incidents in District Columbia within 2010-2014 range</h2>
      </div>
      <dc-mode-select v-model="pickedMode" :options="modes" />

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
    <dc-details
      v-show="pickedCounty"
      :label="pickedCounty && pickedCounty.name"
      :chart-data="pickedChartData"
      class="details"
    />
    <dc-areas-map
      :mode="pickedMode"
      :geo-data="geoData"
      :area-outline-color="areaOutlineColor"
      :area-fill-color="areaFillColor"
      class="map"
      @area-picked="areaPicked"
    />
  </div>
</template>

<script>
import * as d3 from 'd3';
import GeoData from '../data/annotatedData.geo';
import DcModeSelect from './components/DcModeSelect.vue';
import DcAreasMap from './components/DcAreasMap.vue';
import DcDetails from './components/DcDetails.vue';

const modes = ['total', '2010', '2011', '2012', '2013', '2014'];

/* normalize the data: replace nulls with zeroes */
GeoData.features = GeoData.features.map(({ properties, ...item }) => {
  modes.forEach((name) => {
    properties[name] = properties[name] || 0; // eslint-disable-line no-param-reassign
  });
  return { properties, ...item };
});

export default {
  components: {
    DcModeSelect,
    DcAreasMap,
    DcDetails,
  },
  data() {
    return {
      modes,
      geoData: GeoData,
      pickedMode: 'total',
      pickedCounty: null,
    };
  },
  computed: {
    areaOutlineColor() {
      return 'rgba(160,160,160,.3)';
    },
    areaFillColor() {
      return [
        'interpolate',
        ['linear'],
        ['/', ['get', this.pickedMode], ['/', ['get', 'shape_area'], ['literal', 1000000]]],
        0,
        this.quartileColorStyle(0),
        this.quartileThreshold(1),
        this.quartileColorStyle(1),
        this.quartileThreshold(2),
        this.quartileColorStyle(2),
        this.quartileThreshold(3),
        this.quartileColorStyle(3),
      ];
    },
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
    pickedChartData() {
      if (!this.pickedCounty) return [];
      const series = this.modes
        .filter(mode => mode !== 'total')
        .map(name => ({ name, value: this.pickedCounty[name] }));
      if (series.every(({ value }) => value === 0)) return [];
      return series;
    },
  },
  methods: {
    areaPicked(value) {
      this.pickedCounty = value;
    },
  },
};
</script>

<style scoped>
body { margin: 0; padding: 0; }
#map { position: absolute; top: 0; bottom: 0; width: 100%; }

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
.details {
  position: absolute;
  background: #fff;
  border: solid 1px #000;
  right: 30px;
  top: 80px;
  bottom: 50px;
  z-index: 3;
  width: 40%;
}
</style>
