<template>
  <div
    class="target"
    ref="target"
    @touchstart.prevent="handleTouchStart"
    @touchmove.prevent="throttledHandleMove"
    @touchend.prevent="handleStopTouching"
    @touchcancel.prevent="handleStopTouching"
  ></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
let dist1 = 0;
const target = ref(null);
const handleTouchStart = (ev) => {
  if (ev.targetTouches.length === 2) {
    //check if two fingers touched screen
    dist1 = Math.hypot(
      ev.touches[0].pageX - ev.touches[1].pageX,
      ev.touches[0].pageY - ev.touches[1].pageY
    );
  }
};
const throttle = function (cb, delay) {
  let shouldWait = false;
  let latestArgs = null;
  const delayFunc = () => {
    if (latestArgs == null) {
      shouldWait = false;
    } else {
      cb(...latestArgs);
      latestArgs = null;
      setTimeout(delayFunc, delay);
    }
  };
  return (...args) => {
    if (shouldWait) {
      latestArgs = args;
      return;
    }
    cb(...args);
    shouldWait = true;
    setTimeout(delayFunc, delay);
  };
};
const handleTouchMove = (ev) => {
  if (ev.targetTouches.length === 2 && ev.changedTouches.length === 2) {
    // Check if the two target touches are the same ones that started
    var dist2 = Math.hypot(
      //get rough estimate of new distance between fingers
      ev.touches[0].pageX - ev.touches[1].pageX,
      ev.touches[0].pageY - ev.touches[1].pageY
    );
    //alert(dist);
    if (dist1 > dist2) {
      //if fingers are closer now than when they first touched screen, they are pinching
      console.log("zoom out");
    }
    if (dist1 < dist2) {
      //if fingers are further apart than when they first touched the screen, they are making the zoomin gesture
      console.log("zoom in");
    }
  }
};
const test = (reference) => {
  console.log(typeof reference);
  reference.addEventListener("click", () => {
    console.log("clicked");
  });
};
const handleStopTouching = () => {
  dist1 = 0;
  console.log("clear distance");
};
const throttledHandleMove = throttle(handleTouchMove, 300);
onMounted(() => {
  if (target.value) target.value.focus();
  console.log("mounted");
  test(target.value);
});
</script>

<style lang="scss" scoped>
.target {
  height: 300px;
  width: 300px;
  background-color: red;
}
</style>
