<template>
  <div class="details">
    <div class="close" @click="$emit('close')">
      ✖
    </div>
    <div class="contents">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
};
</script>

<style scoped>
.details {
  padding: 10px;
}
h2, p {
  margin: 0;
}
p {
  font-size: .8em;
  color: #999;
}
.close {
  position: absolute;
  right: 16px;
  top: 10px;
  width: 10px;
  height: 10px;
  cursor: pointer;
}

</style>
