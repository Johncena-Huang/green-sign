<template>
  <div class="signature-board-container">
    <div class="overlay-header">
      <a href="/">
        <img src="../assets/logo.png" />
      </a>
      <!-- signature-method-toggle -->
      <div class="signature-method-toggle">
        <q-btn-toggle
          v-model="signatureMethods"
          text-color="#1C8B6A"
          color="white"
          :options="[
            { label: '手寫簽名', value: 'hand-write' },
            {
              label: '匯入簽名檔',
              value: 'import',
            },
          ]"
        />
      </div>
      <div class="invisible"><img src="../assets/logo.png" /></div>
    </div>
    <div class="wrapper">
      <div class="signature-group">
        <!-- Signature pad -->
        <div class="signature-pad" v-if="signatureMethods === 'hand-write'">
          <!-- pen colors -->
          <div class="color-picker">
            <label class="color-picker__color">
              <input
                type="radio"
                name="color"
                class="color-picker__input"
                value="black"
                checked
                v-model="penColor"
              />
              <span
                class="color-picker__label color-picker__label--black"
              ></span>
            </label>
            <label class="color-picker__color">
              <input
                type="radio"
                name="color"
                class="color-picker__input"
                value="blue"
                v-model="penColor"
              />
              <span
                class="color-picker__label color-picker__label--blue"
              ></span>
            </label>
            <label class="color-picker__color">
              <input
                type="radio"
                name="color"
                class="color-picker__input"
                value="red"
                v-model="penColor"
              />
              <span class="color-picker__label color-picker__label--red"></span>
            </label>
          </div>
          <!-- signature board -->
          <div class="signature-board" ref="canvasWrapper">
            <canvas
              class="signature-board__canvas"
              width="590"
              height="224"
              ref="canvas"
              @mousedown.prevent="handleMouseDown"
              @mousemove.prevent="handleMouseMove"
              @mouseenter.prevent="handleMouseEnter"
              @touchstart.prevent="handleTouchStart"
              @touchmove.prevent="handleTouchMove"
              @touchend.prevent="handleStopTouching"
              @touchcancel.prevent="handleStopTouching"
            ></canvas>
          </div>
        </div>
        <!-- Signature importer -->
        <div class="signature-importer" v-else>
          <div class="signature-importer__renderer">
            <div
              class="signature-importer__uploader"
              v-show="!importedSignatureURL"
            >
              <input
                class="signature-importer__input"
                type="file"
                accept="image/*"
                id="file-upload"
                @change.prevent="handleSignatureUpload"
              />
              <label class="signature-importer__input-label" for="file-upload"
                >請選擇檔案</label
              >
            </div>
            <img
              class="signature-importer__image"
              :src="importedSignatureURL"
              alt="imported-signature"
              v-show="importedSignatureURL"
            />
          </div>
        </div>
      </div>
      <!-- signature controls -->
      <div class="signature-controls">
        <div class="">
          <q-btn
            class="signature-controls__button signature-controls__button--clear"
            label="清除"
            @click.prevent="handleEraseCanvas"
          />
        </div>
        <div class="">
          <q-btn
            class="signature-controls__button signature-controls__button--create"
            label="建立簽名"
            @click.prevent="handleCreateSignature"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineEmits, watch } from "vue";
// ======================= EMITS =======================
const emit = defineEmits(["signature-complete"]);
// ======================= DATA =======================
// State
/**
 * @typedef {"hand-write" | "import" } Method
 */
/**
 * Control the method of embedding the signature
 * @type {Method}
 */
const signatureMethods = ref("hand-write");
const importedSignatureURL = ref(null);
const penColor = ref("black");
const ongoingTouches = [];
const position = {
  x: 0,
  y: 0,
};
let isDrawing = false;
// DOM Reference
const canvas = ref(null);
const canvasWrapper = ref(null); // For auto-adjusting the canvas dimension
const ctx = ref(null);
// ======================= HELPERS =======================
const isCanvasDrawn = (canvas) => {
  if (!canvas) return false;
  return canvas
    .getContext("2d")
    .getImageData(0, 0, canvas.width, canvas.height)
    .data.some((channel) => channel !== 0);
};
/**
 * Resize the canvas element
 */
const resizeCanvas = function () {
  if (!canvas.value) return; // No need to resize when user toggles to image import
  const MOBILE_SCREEN = 688;
  const viewportWidth = window.innerWidth;
  if (viewportWidth <= MOBILE_SCREEN) {
    canvas.value.height = 200;
  }
  canvas.value.width = canvasWrapper.value.clientWidth;
};
/**
 * Draw a line on the canvas based on two points
 * @param {object} position1 the x, y position of point1
 * @param {object} position2 the x, y position of point2
 */
const draw = (position1, position2) => {
  ctx.value.beginPath();
  ctx.value.strokeStyle = penColor.value; // Draw a line in our chosen color
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
/**
 * Get the relative position of touch event to the reference element itself
 * @param {object} canvasRef the referece to the DOM element
 * @param {object} touch  the touch event object
 * @return {object} the object with x,y properties as position
 */
// we need this helper because no "offset" on touch event object
const getTouchPosition = (canvasRef, touch) => {
  const rect = canvasRef.getBoundingClientRect();
  const position = {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
  };
  return position;
};
// ======================= METHODS =======================
// Touch Handlers
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
// Mouse Handlers
const handleMouseDown = (e) => {
  position.x = e.offsetX;
  position.y = e.offsetY;
  document.addEventListener("mouseup", handleStopDrawing, { once: true });
  isDrawing = true;
};
const handleStopDrawing = (e) => {
  if (!isDrawing) return;
  e.preventDefault();
  //   draw(position, { x: e.offsetX, y: e.offsetY });
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
// Button Handlers
const handleEraseCanvas = () => {
  if (signatureMethods.value === "hand-write") {
    ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
  } else {
    importedSignatureURL.value = null;
  }
};
const handleCreateSignature = () => {
  if (!isCanvasDrawn(canvas.value) && !importedSignatureURL.value) return;
  console.log("drawn");
  let dataURL;
  if (signatureMethods.value === "hand-write") {
    // Turn the signature into the image in the text form
    dataURL = canvas.value.toDataURL();
  } else {
    dataURL = importedSignatureURL.value;
  }
  emit("signature-complete", dataURL);
};
// Signature import handler
const handleSignatureUpload = (e) => {
  const file = e.target.files[0];
  const fileType = file.type;
  const isImageFile = fileType.startsWith("image/");
  if (!isImageFile) return;
  const reader = new FileReader();
  reader.onload = function () {
    importedSignatureURL.value = this.result;
  };
  reader.readAsDataURL(file);
  e.target.value = null; // clear up the input field so that user can upload again
};
// ======================= LIFE CYCLE HOOKS =======================
onMounted(() => {
  window.addEventListener("resize", resizeCanvas);
});
onUnmounted(() => {
  window.removeEventListener("resize", resizeCanvas);
});
watch(
  // Resize canvas upon toggling
  canvas,
  (ref, _) => {
    if (ref) {
      ctx.value = ref.getContext("2d");
      resizeCanvas();
    }
  },
  {
    immediate: true,
  }
);
</script>

<style lang="scss" scoped>
$desktop-screen: 64em;
$mobile-screen: 43em;

.signature-board-container {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  height: 100vh;
  width: 100%;
  padding-top: calc(14.3rem);
  background-color: #f0f0f0;
}
.overlay-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 2.8rem 4rem 2rem 4rem;
  height: 5.8rem;
  .signature-method-toggle {
    align-self: self-end;
  }
}
.wrapper {
  padding: 0 1.6rem;
  max-width: calc(59rem + 3.2rem);
  margin: 0 auto;
}
// Override default quasar button group
.q-btn-group :deep(.q-btn) {
  font-weight: 400;
  font-size: 1.6rem;
  line-height: 23px;
  width: 11.4rem;
  height: 4rem;
  color: #1c8b6a;
}
.q-btn-group :deep(.q-btn[aria-pressed="true"]) {
  background: linear-gradient(180deg, #35a483 0%, #077854 100%) !important;
  border-radius: 14px;
}
.q-btn-group {
  border-radius: 14px;
}

.color-picker {
  display: flex;
  justify-content: center;
  gap: 1.6rem;
  margin-bottom: 2.9rem;
  &__input {
    display: none;
  }
  &__input:checked ~ &__label--black {
    border: 2px solid #000000;
  }
  &__input:checked ~ &__label--blue {
    border: 2px solid #0014c7;
  }
  &__input:checked ~ &__label--red {
    border: 2px solid #ca0000;
  }
  &__color {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
  &__label {
    display: inline-block;
    position: relative;
    width: 4.5rem;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    border-radius: 50%;
  }
  &__label::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: inline-block;
    width: 3.4rem;
    aspect-ratio: 1 / 1;
    border-radius: 50%;
  }
  &__label--black::after {
    background-color: #000000;
  }
  &__label--blue::after {
    background-color: #0014c7;
  }
  &__label--red::after {
    background-color: #ca0000;
  }
}
.signature-board {
  width: 100%;
  line-height: 0;
  &__canvas {
    background: #ffffff;
    border-radius: 26px;
  }
}
.signature-group {
  margin-bottom: 3.9rem;
}
.signature-importer {
  // Layout
  width: 100%;
  height: 22.4rem;
  // display: flex;
  // justify-content: center;
  // align-items: center;
  margin-top: 7.4rem;
  // Positioning
  position: relative;
  // Visual
  background: #ffffff;
  border-radius: 26px;
  &__input {
    opacity: 0; /* make transparent */
    z-index: -1; /* move under anything else */
    position: absolute; /* don't let it take up space */
  }
  &__input:focus + label {
    text-decoration: underline;
  }
  &__input:hover + label {
    text-decoration: underline;
  }
  &__input-label {
    font-weight: 400;
    font-size: 2.2rem;
    line-height: 20rem;
    // line-height: 32px;
    color: #b7b7b7;
    cursor: pointer;
  }
  &__renderer {
    width: 100%;
    height: 20rem;
    background: #ffffff;
    border-radius: 26px;
  }
  &__uploader {
    width: 100%;
    height: 100%;
    text-align: center;
  }
  &__image {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}
.signature-controls {
  // layouting
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-column-gap: 1.6rem;
  //   positioning
  max-width: 59rem;
  margin: 0 auto;
  &__button {
    width: 100%;
    padding: 1.45rem;
    border-radius: 16px;
    font-weight: 400;
    font-size: 1.8rem;
    line-height: 27px;
  }
  &__button--clear {
    border: 1px solid #1c8b6a;
    color: #1c8b6a;
  }
  &__button--create {
    background: linear-gradient(180deg, #35a483 0%, #077854 100%);
    color: #ffffff;
  }
}
@media screen and (max-width: $desktop-screen) {
  .overlay-header {
    justify-content: center;
    img {
      display: none;
    }
  }
}
@media screen and (max-width: $mobile-screen) {
  .color-picker {
    margin-bottom: 1.2rem;
  }
  .signature-group {
    margin-bottom: 2.5rem;
  }
  .signature-importer {
    height: 20rem;
    margin-top: calc(7.4rem - 1.7rem); // shrink from 2.9 to 1.2
  }
}
</style>
