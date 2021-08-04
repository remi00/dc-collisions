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
    <div class="normalize">
      <input
        id="normalize"
        type="checkbox"
        :checked="normalize"
        @change="normalizeToggled"
      >
      <label for="normalize">
        Normalize per county area
      </label>
    </div>
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
.toggles * {
  display: inline-block;
}
.item {
  border: solid 1px #000;
  background: #fff;
  padding: 2px 5px;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 100ms linear;
}
.item:hover {
  background: #ddd;
}
.item.active {
  color: #fff;
  background: #000;
  transition: all 100ms linear;
}
.normalize {
  display: block;
  background: rgba(255,255,255,.5);
  border-radius: 4px;
  padding: 3px;
  margin-top: 10px;
  max-width: 240px;
}
.normalize input[type=checkbox] {
  margin-left: 0;
}
@media screen and (min-width: 640px) {
  .normalize {
    display: inline-block;
    margin-left: 20px;
    margin-top: 0;
  }
  .normalize input[type=checkbox] {
    margin-left: unset;
  }
}
</style>
