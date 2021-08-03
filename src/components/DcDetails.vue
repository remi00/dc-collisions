<template>
  <div class="details">
    <div class="close" @click="$emit('close')">
      ✖
    </div>
    <div class="contents">
      <h2>{{ label }}</h2>
      <p v-if="subtitle">
        {{ subtitle }}
      </p>
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },
  },
};
</script>

<style scoped>
.close {
  position: absolute;
  right: 10px;
  top: 10px;
  width: 10px;
  height: 10px;
  cursor: pointer;
}
</style>
