<template>
  <div>
    <div class="banner">
      <h1>D.C. Collisions</h1>
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
      :label="pickedCounty && pickedCounty.name"
      :subtitle="detailsSubtitle"
      class="details"
      @close="pickedCounty = null"
    >
      <div v-show="isEmpty">
        No accidents in this area...
      </div>
      <dc-chart
        v-show="!isEmpty"
        :x-max="perCountyDataMaxValue"
        :series="pickedCountyDataSeries"
      />
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
      const clusters = this.pickedModeDataQuantiles(2);
      return [...clusters.map(([first]) => first), this.pickedModeDataMaxValue];
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
      return this.normalizePerArea ? 'Crashes per year normalized per county area' : 'Total crashes per year';
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

<style scoped>
body { margin: 0; padding: 0; }

.banner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 128px;
  width: 100%;
  padding: 20px;
  z-index: 1;
  background: rgb(255,255,255);
  background: linear-gradient(180deg, rgba(255,255,255,1) 20%, rgba(255,255,255,0) 100%);
}
.banner h1, .banner h2 {
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
  top: 80px;
  width: 100%;
  z-index: 1;
}

.legend {
  position: absolute;
  left: 20px;
  top: 200px;
  width: 30%;
  z-index: 3;
  border: solid 1px black;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  padding: 1px 4px;
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
