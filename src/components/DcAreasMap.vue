<template>
  <div id="map" />
</template>

<script>
import MapboxGl from 'mapbox-gl/dist/mapbox-gl';

MapboxGl.accessToken = process.env.MAPBOX_API_KEY;

export default {
  components: {
  },
  props: {
    mode: {
      type: String,
      default: 'total',
    },
    normalize: {
      type: Boolean,
      default: true,
    },
    geoData: {
      type: Object,
      required: true,
    },
    areaFillColor: {
      type: [Array, String],
      default: '',
    },
    areaOutlineColor: {
      type: [Array, String],
      default: '',
    },
    highlighted: {
      type: [Number, String],
      default: undefined,
    },
  },
  data() {
    return {
      map: null,
    };
  },
  computed: {
  },
  watch: {
    mode: {
      immediate: true,
      handler() {
        this.setDefaultMapLayer();
      },
    },
    normalize: {
      immediate: true,
      handler() {
        this.setDefaultMapLayer();
      },
    },
    highlighted: {
      immediate: true,
      handler() {
        if (!this.map) return;
        // display only features with the 'name' property 'USA'
        this.map.setFilter('highlights', ['==', ['get', 'objectid'], this.highlighted]);
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
      this.map.addSource('sources', {
        type: 'geojson',
        data: this.geoData,
      });
      this.setDefaultMapLayer();
      this.setHighlightMapLayer();

      // When a click event occurs on a feature in the counties layer, open a popup at the
      // location of the feature, with description HTML from its properties.
      this.map.on('click', 'areas', (e) => {
        this.$emit('area-picked', e.features[0].properties);
      });

      // Change the cursor to a pointer when the mouse is over the counties layer.
      this.map.on('mouseenter', 'areas', () => {
        this.map.getCanvas().style.cursor = 'pointer';
      });

      // Change it back to a pointer when it leaves.
      this.map.on('mouseleave', 'areas', () => {
        this.map.getCanvas().style.cursor = '';
      });
    });
  },
  methods: {
    setDefaultMapLayer() {
      if (!this.map) return;
      if (this.map.getLayer('areas')) this.map.removeLayer('areas');
      this.map.addLayer({
        id: 'areas',
        type: 'fill',
        source: 'sources',
        paint: {
          'fill-outline-color': this.areaOutlineColor,
          'fill-color': this.areaFillColor,
        },
      });
    },
    setHighlightMapLayer() {
      if (!this.map) return;
      if (this.map.getLayer('highlights')) this.map.removeLayer('highlights');
      this.map.addLayer({
        id: 'highlights',
        type: 'line',
        source: 'sources',
        paint: {
          'line-width': 2,
          'line-color': '#000000',
        },
      });
      this.map.setFilter('highlights', ['==', ['get', 'objectid'], this.highlighted]);
    },
  },
};
</script>
<style scoped>
#map { position: absolute; top: 0; bottom: 0; left: 0; right: 0; width: 100%; }

</style>
