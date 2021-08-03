<template>
  <div class="filter">
    <div
      v-for="item in options"
      :key="item"
      class="item"
      :class="{ active: item === modelValue }"
      @click="picked(item)"
    >
      {{ item }}
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
    modelValue: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  methods: {
    picked(item) {
      if (item === this.modelValue) return;
      this.$emit('update:modelValue', item);
    },
  },
};
</script>

<style scoped>
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
  color: #900;
  font-weight: bold;
}
</style>
