<template>
  <div>
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import { shallowRef, onMounted } from "vue";
import { fabric } from "fabric";
const canvasRef = shallowRef(null);
const fabricCanvas = shallowRef(null);

onMounted(() => {
  fabricCanvas.value = new fabric.Canvas(canvasRef.value);
  const text = new fabric.Text("Upload PDF");
  fabricCanvas.value.add(text);
});
</script>

<style lang="scss" scoped></style>
