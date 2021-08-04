<template>
  <div>
    <div class="banner">
      <h1>D.C. Visualize</h1>
      <h2>Frequency of car incidents in District Columbia within 2010-2014 range</h2>
    </div>

    <dc-toggles
      v-model:mode="pickedMode"
      v-model:normalize="normalizePerArea"
      :options="modes"
      class="toggles"
    />

    <div
      class="legend"
      :style="{ background: legendBackground }"
    >
      <div
        v-for="value in pickedModeDataRanges"
        :key="value"
      >
        {{ round(value) }}
      </div>
    </div>

    <dc-details
      v-show="pickedCounty"
      class="details"
      @close="pickedCounty = null"
    >
      <h2>{{ pickedCounty && pickedCounty.name }}</h2>
      <p><strong>&sum; {{ pickedCounty && pickedCounty.total }}</strong> {{ detailsSubtitle }}</p>
      <div v-show="isEmpty">
        No accidents in this area...
      </div>
      <div class="diagram-container">
        <dc-chart
          v-show="!isEmpty"
          :x-max="perCountyDataMaxValue"
          :series="pickedCountyDataSeries"
          class="diagram"
        />
      </div>
    </dc-details>

    <dc-areas-map
      :mode="pickedMode"
      :normalize="normalizePerArea"
      :geo-data="geoData"
      :area-outline-color="areaOutlineColor"
      :area-fill-color="areaFillColor"
      :highlighted="pickedCounty && pickedCounty.objectid"
      class="map"
      @area-picked="areaPicked"
    />
  </div>
</template>

<script>
import GeoData from '../data/annotatedData.geo.json';
import DcToggles from './components/DcToggles.vue';
import DcAreasMap from './components/DcAreasMap.vue';
import DcDetails from './components/DcDetails.vue';
import DcChart from './components/DcChart.vue';
import quantiles from './helpers/quantiles';

const years = ['2010', '2011', '2012', '2013', '2014'];
const modes = ['total', ...years];

const clusters = [0, 1, 2]; // use just median to split the data into colour-codes

/* normalize the data: replace nulls with zeroes */
GeoData.features = GeoData.features.map(({ properties, ...item }) => {
  modes.forEach((name) => {
    properties[name] = properties[name] || 0; // eslint-disable-line no-param-reassign
  });
  return { properties, ...item };
});

export default {
  components: {
    DcToggles,
    DcAreasMap,
    DcDetails,
    DcChart,
  },
  data() {
    return {
      modes,
      geoData: GeoData,
      pickedMode: 'total',
      pickedCounty: null,
      normalizePerArea: true,
    };
  },
  computed: {
    areaOutlineColor() {
      return 'rgba(160,160,160,.3)';
    },
    fillColorFormula() {
      if (this.normalizePerArea) {
        return ['/', ['get', this.pickedMode], ['/', ['get', 'shape_area'], ['literal', 1000000]]];
      }
      return ['get', this.pickedMode];
    },
    areaFillColor() {
      return [
        'interpolate',
        ['linear'],
        this.fillColorFormula,
        ...clusters.flatMap(index => ([
          this.pickedModeDataRanges[index],
          this.dataRangeColorStyles(index),
        ])),
      ];
    },
    dataRangeColorStyles() {
      return (n) => {
        if (n === 0) return 'rgba(0,0,0,.2)';
        if (n === 1) return 'rgba(255,0,0,.4)';
        return 'rgba(255,255,0,.5)';
      };
    },
    pickedModeDataValues() {
      return this.geoData.features.map(({ properties }) =>
        (this.normalizePerArea
          ? properties[this.pickedMode] / (properties.shape_area / 1000000)
          : properties[this.pickedMode]));
    },
    pickedModeDataQuantiles() {
      return quantiles(this.pickedModeDataValues);
    },
    pickedModeDataMaxValue() {
      const [sorted] = this.pickedModeDataQuantiles(1);
      return sorted[sorted.length - 1];
    },
    pickedModeDataRanges() {
      return [
        ...this.pickedModeDataQuantiles(2).map(([first]) => first),
        this.pickedModeDataMaxValue,
      ];
    },
    perCountyDataMaxValue() {
      const maxesPerCounty = this.geoData.features.map(({ properties }) => {
        const max = Math.max(...years.map(year => properties[year]));
        if (!this.normalizePerArea) return max;
        return max / (properties.shape_area / 1000000);
      });
      return Math.max(...maxesPerCounty);
    },
    pickedCountyDataSeries() {
      if (!this.pickedCounty) return [];
      const series = years
        .map(name => ({
          name,
          value: this.normalizePerArea
            ? this.pickedCounty[name] / (this.pickedCounty.shape_area / 1000000)
            : this.pickedCounty[name],
        }));
      if (series.every(({ value }) => value === 0)) return [];
      return series;
    },
    isEmpty() {
      return !this.pickedCounty || !this.pickedCounty.total;
    },
    detailsSubtitle() {
      return `crashes per year${this.normalizePerArea ? ' normalized per county area' : ''}`;
    },
    legendBackground() {
      return `linear-gradient(to right, ${clusters.map(index => this.dataRangeColorStyles(index)).join(',')})`;
    },
  },
  methods: {
    areaPicked(value) {
      this.pickedCounty = value;
    },
    round(value) {
      return Number(value).toFixed(1);
    },
  },
};
</script>

<style>
body {
  margin: 0; padding: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-family: system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    Droid Sans,
    "Helvetica Neue",
    sans-serif;
}

</style>
<style scoped>
.banner {
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  padding: 20px;
  height: 128px;
  z-index: 1;
  background: rgb(255,255,255);
  background: linear-gradient(180deg, rgba(255,255,255,1) 20%, rgba(255,255,255,0) 100%);
}
h1, h2, h3, p {
  margin: 0;
}
.banner h1 {
  font-size: 2em;
}
.banner h2 {
  font-size: 1em;
  font-weight: normal;
}

.toggles {
  position: absolute;
  left: 0;
  top: 100px;
  width: 100%;
  z-index: 1;
}
@media screen and (min-width: 640px) {
  .toggles {
    top: 80px;
  }
}

.legend {
  position: absolute;
  left: 20px;
  top: 200px;
  right: 20px;
  z-index: 1;
  border: solid 1px black;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  padding: 2px 5px;
}
@media screen and (min-width: 640px) {
  .legend {
    top: 150px;
  }
}

@media screen and (min-width: 960px) {
  .legend {
    left: unset;
    top: 100px;
    right: 20px;
    width: 30%;
    max-width: 500px;
  }
}

.details {
  position: absolute;
  background: #fff;
  border: solid 1px #333;
  left: 30px;
  right: 30px;
  bottom: 30px;
  z-index: 2;
  filter: drop-shadow(0 0 2px #66666699);
  border-radius: 14px;
  height: 240px;
}
@media screen and (min-width: 640px) {
  .details {
    right: unset;
    width: 80%;
    max-width: 320px;
    height: 275px;
  }
}
.diagram-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
.diagram {
  width: 260px;
  height: 180px;
}
</style>
