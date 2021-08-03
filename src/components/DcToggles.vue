<template>
  <div class="toggles">
    <div
      v-for="item in options"
      :key="item"
      class="item"
      :class="{ active: item === mode }"
      @click="modePicked(item)"
    >
      {{ item }}
    </div>
    <input type="checkbox" id="normalize" :checked="normalize" @change="normalizeToggled">
    <label for="normalize">Normalize per county area</label>
  </div>
</template>

<script>
export default {
  props: {
    options: {
      type: Array,
      required: true,
    },
    mode: {
      type: String,
      default: '',
    },
    normalize: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:mode', 'update:normalize'],
  methods: {
    modePicked(item) {
      if (item === this.mode) return;
      this.$emit('update:mode', item);
    },
    normalizeToggled() {
      this.$emit('update:normalize', !this.normalize);
    },
  },
};
</script>

<style scoped>
.toggles {
  padding: 20px;
}
.item {
  display: inline-block;
  border: solid 1px #000;
  background: #fff;
  padding: 2px 5px;
  cursor: pointer;
  text-transform: uppercase;
}
.item:hover {
  background: #ddd;
}
.item.active {
  color: #600;
  background: #ffc;
}
</style>
