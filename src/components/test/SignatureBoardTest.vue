<template>
  <div>
    <div>canvas</div>
    <canvas
      width="500"
      height="500"
      style="background-color: #eee"
      ref="canvas"
      @mousedown.prevent="handleMouseDown"
      @mousemove.prevent="handleMouseMove"
      @mouseenter.prevent="handleMouseEnter"
      @touchstart.prevent="handleTouchStart"
      @touchmove.prevent="handleTouchMove"
      @touchend.prevent="handleStopTouching"
      @touchcancel.prevent="handleStopTouching"
    ></canvas>
    <div>
      <button @click="handleTransform">Transform</button>
    </div>
    <div>y:{{ position.y }}</div>
  </div>
</template>

<script setup>
import { shallowRef, onMounted, reactive, ref } from "vue";
let isDrawing = false;
const canvas = shallowRef(null);
const ctx = shallowRef(null);
const ongoingTouches = [];
const position = reactive({
  x: 0,
  y: 0,
});
onMounted(() => {
  if (canvas.value) ctx.value = canvas.value.getContext("2d");
});
const handleTouchStart = (e) => {
  // there is no "offset" on touch event object
  const touches = e.changedTouches;
  [...touches].forEach((touch) => {
    const touchPosition = getTouchPosition(canvas.value, touch);
    ongoingTouches.push({ id: touch.identifier, ...touchPosition });
  });
  // changed array is going to only have one elements at a time on touchStart
  isDrawing = true;
};
const handleTouchMove = (e) => {
  if (!isDrawing) return;
  const touches = e.changedTouches;
  [...touches].forEach((touch) => {
    const indexOfTouch = ongoingTouches.findIndex(
      (currentTouch) => currentTouch.id === touch.identifier
    );
    // If the changed touch isn't in the onGoing array
    if (indexOfTouch === -1) return;
    // get the correct position of touch event
    const newTouchPosition = getTouchPosition(canvas.value, touch);
    draw(ongoingTouches[indexOfTouch], newTouchPosition);
    // Update the touch position in the ongoing array
    ongoingTouches.splice(indexOfTouch, 1, {
      id: touch.identifier,
      ...newTouchPosition,
    });
  });
};
const handleStopTouching = (e) => {
  if (!isDrawing) return;
  const touches = e.changedTouches;
  [...touches].forEach((touch) => {
    // Find the matched touch index in the ongoing array to remove
    const indexOfTouch = ongoingTouches.findIndex(
      (currentTouch) => currentTouch.id === touch.identifier
    );
    // Remove the touch object from the ongoing array
    ongoingTouches.splice(indexOfTouch, 1);
  });
};
const handleMouseDown = (e) => {
  position.x = e.offsetX;
  position.y = e.offsetY;
  document.addEventListener("mouseup", handleStopDrawing, { once: true });
  isDrawing = true;
};
const handleStopDrawing = (e) => {
  if (!isDrawing) return;
  e.preventDefault();
  draw(position, { x: e.offsetX, y: e.offsetY });
  position.x = 0;
  position.y = 0;
  isDrawing = false;
};
const handleMouseEnter = (e) => {
  if (!isDrawing) return;
  position.x = e.offsetX;
  position.y = e.offsetY;
};
const handleMouseMove = (e) => {
  if (!isDrawing) return;
  draw(position, {
    x: e.offsetX,
    y: e.offsetY,
  });
  position.x = e.offsetX;
  position.y = e.offsetY;
};
// HELPER FUNCTIONS
// Draw the line based on two given points
const draw = (position1, position2) => {
  ctx.value.beginPath();
  ctx.value.strokeStyle = "black";
  ctx.value.lineWidth = 2;
  ctx.value.lineCap = "round";
  ctx.value.lineJoin = "round";
  ctx.value.shadowBlur = 1;
  ctx.value.shadowColor = "black";
  ctx.value.moveTo(position1.x, position1.y);
  ctx.value.lineTo(position2.x, position2.y);
  ctx.value.stroke();
  ctx.value.closePath();
};
// Get the relative position of touch event
// because no "offset" on touch event
const getTouchPosition = (canvasRef, touch) => {
  const rect = canvasRef.getBoundingClientRect();
  const position = {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
  };
  return position;
};
const handleTransform = () => {
  const dataURL = canvas.value.toDataURL();
  console.log(dataURL);
};
</script>

<style lang="scss" scoped></style>

<!-- IMPORTANT -->
<!-- 
  ***CANVAS
  1. canvas has two sizes (a.) the element itself (2.) the drawing surface
  reference
  https://www.informit.com/articles/article.aspx?p=1903884#:~:text=The%20difference%20between%20using%20CSS,of%20the%20element's%20drawing%20surface.
  -> setting width, height attributes on canvas element itself(tackling both at the same time)
  2. how to size canvas to 100%?
  https://stackoverflow.com/questions/10214873/make-canvas-as-wide-and-as-high-as-parent
 -->
