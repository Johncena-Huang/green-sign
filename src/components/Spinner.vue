<template>
  <div class="loading">
    <div class="loading__inner">
      <Vue3Lottie :animationData="LoadingJSON" :width="132" />
      <div class="uploading__text">{{ props.loadingText }}</div>
    </div>
  </div>
</template>

<script setup>
import { Vue3Lottie } from "vue3-lottie";
import "vue3-lottie/dist/style.css";
import LoadingJSON from "../assets/json/loading.json";
const props = defineProps({
  loadingText: {
    type: String,
    default: "",
  },
});
</script>

<style lang="scss" scoped>
.loading {
  height: 100vh;
}
.uploading__text {
  color: #424242;
  text-align: center;
  font-size: 1.8rem;
  font-weight: 400;
  line-height: 27px;
}
.loading__inner {
  position: relative;
  left: 50%;
  top: 30%;
  transform: translate(-50%, -50%);
}
</style>
