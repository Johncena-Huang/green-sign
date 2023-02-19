<template>
  <Transition name="scale" :duration="500" appear>
    <div
      class="signature-board-popup"
      v-show="props.show"
      tabindex="-1"
      @keyup.esc.stop="onEsc"
      ref="popupRef"
    >
      <div class="signature-board-popup__dialog inner">
        <div class="signature-board-popup__header">
          <q-btn-toggle
            v-model="signatureMethods"
            text-color="#1C8B6A"
            color="white"
            class="signature-method-toggle"
            :options="[
              { label: '手寫簽名', value: 'hand-write' },
              {
                label: '匯入簽名檔',
                value: 'import',
              },
            ]"
          />
        </div>
        <div class="signature-board-popup__content">
          <div class="signature-input-group">
            <!-- Signature pad -->
            <div class="signature-pad" v-if="signatureMethods === 'hand-write'">
              <div class="signature-pad__tools">
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
                    <span
                      class="color-picker__label color-picker__label--red"
                    ></span>
                  </label>
                </div>
                <q-btn
                  label="清除"
                  class="signature-btn-erase"
                  flat
                  dense
                  :ripple="false"
                  :glossy="false"
                  @click.prevent="handleEraseCanvas"
                />
              </div>
              <div class="signature-pad__signature-area" ref="canvasWrapper">
                <canvas
                  class="signature-pad__canvas"
                  width="590"
                  height="200"
                  ref="canvas"
                  @mousedown.prevent="handleMouseDown"
                  @mousemove.prevent="handleMouseMove"
                  @mouseenter.prevent="handleMouseEnter"
                  @touchstart.prevent.passive="handleTouchStart"
                  @touchmove.prevent.passive="handleTouchMove"
                  @touchend.prevent="handleStopTouching"
                  @touchcancel.prevent="handleStopTouching"
                ></canvas>
              </div>
            </div>
            <!-- Signature importer -->
            <div class="signature-importer" v-else>
              <div class="signature-importer__tools">
                <q-btn
                  label="清除"
                  class="signature-btn-erase"
                  flat
                  dense
                  :ripple="false"
                  :glossy="false"
                  @click.prevent="handleEraseCanvas"
                />
              </div>
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
                  <label
                    class="signature-importer__input-label"
                    for="file-upload"
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
        </div>
        <div class="signature-board-popup__footer">
          <q-btn
            class="signature-btn-control signature-btn-control--cancel"
            label="取消"
            dense
            @click.stop.prevent="emit('popup-closed')"
          />
          <q-btn
            class="signature-btn-control signature-btn-control--create"
            label="建立簽名"
            dense
            @click.stop.prevent="handleCreateSignature"
          />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import {
  ref,
  watch,
  nextTick,
  onUnmounted,
  defineProps,
  defineEmits,
} from "vue";
import useNotify from "../composables/notify";
// ======================= COMPOSABLE =======================
const notify = useNotify();
// ======================= PROPS =======================
const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});
// ======================= EMIT =======================
const emit = defineEmits(["popup-closed", "signature-created"]);
// ======================= DATA =======================
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
const popupRef = ref(null);
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
// Popup close handler
const handlePopupClose = (e) => {
  const insidePopup = e.target.closest(".signature-board-popup");
  const outsidePopupDialog = !e.target.closest(
    ".signature-board-popup__dialog"
  );
  const shouldClosePopup = insidePopup && outsidePopupDialog;
  if (!shouldClosePopup) return;
  emit("popup-closed");
};
const handleCreateSignature = () => {
  if (!isCanvasDrawn(canvas.value) && !importedSignatureURL.value)
    return notify.showMessage("請置入簽名後再完成簽署");
  let dataURL;
  if (signatureMethods.value === "hand-write") {
    // Turn the signature into the image in the text form
    dataURL = canvas.value.toDataURL();
  } else {
    dataURL = importedSignatureURL.value;
  }
  emit("signature-created", dataURL);
  emit("popup-closed");
};
// On Esc
const onEsc = () => {
  if (!props.show) return;
  emit("popup-closed");
};
// ======================= LIFE CYCLES =======================
onUnmounted(() => {
  window.removeEventListener("click", handlePopupClose);
});
// ======================= WATCHERS =======================
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
watch(
  () => props.show,
  async (show, _) => {
    if (!show) {
      window.removeEventListener("click", handlePopupClose);
    } else {
      window.addEventListener("click", handlePopupClose);
      await nextTick(); // wait until the popup comes into DOM
      popupRef.value.focus(); // in order for esc to work
      resizeCanvas();
    }
  }
);
</script>

<style lang="scss" scoped>
$desktop-screen: 64em;
$mobile-screen: 43em;
.signature-board-popup {
  // Positioning
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9999;
  // Layouting
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  // Visual
  background: rgba(186, 186, 186, 0.47);
  backdrop-filter: blur(2.5px);
  &__dialog {
    width: 61rem;
    height: 43.7rem;
    padding: 2.4rem 1rem;
    background: #f0f0f0;
    box-shadow: 1px 4px 6px rgba(0, 0, 0, 0.11);
    border-radius: 26px;
  }
  &__header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 1.6rem;
  }
  &__content {
    margin-bottom: 1.6rem;
  }
  &__footer {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1.2rem;
  }
}

.signature-method-toggle :deep(.q-btn) {
  font-weight: 400;
  font-size: 1.6rem;
  line-height: 23px;
  width: 11.4rem;
  height: 4rem;
  color: #1c8b6a;
}

.signature-method-toggle :deep(.q-btn[aria-pressed="true"]) {
  background: linear-gradient(180deg, #35a483 0%, #077854 100%) !important;
  border-radius: 14px;
}

.signature-method-toggle {
  border-radius: 14px;
}
.signature-pad {
  &__tools {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.6rem;
  }
  &__signature-area {
    width: 100%;
    line-height: 0;
  }
  &__canvas {
    background: #ffffff;
    border-radius: 26px;
  }
}
.color-picker {
  display: flex;
  justify-content: center;
  gap: 1.6rem;
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

.signature-btn-erase {
  color: #1c8b6a;
}

.signature-group {
  margin-bottom: 3.9rem;
}
.signature-importer {
  // Layout
  width: 100%;
  //   display: flex;
  //   justify-content: center;
  //   align-items: center;
  // Positioning
  position: relative;
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
    line-height: 20rem; //new
    // line-height: 32px;
    color: #b7b7b7;
    cursor: pointer;
  }
  &__tools {
    height: 4.5rem;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 1.6rem;
  }
  &__renderer {
    width: 100%;
    height: 20rem; // new
    background: #ffffff;
    border-radius: 26px;
  }
  &__uploader {
    // new
    width: 100%;
    height: 100%;
    text-align: center;
  }
  &__image {
    // new
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}
.signature-btn-control {
  font-weight: 400;
  font-size: 1.8rem;
  line-height: 27px;
  color: #1c8b6a;
  width: 13.6rem;
  height: 5.6rem;
  border-radius: 16px;
  &--cancel {
    border: 1px solid #1c8b6a;
  }
  &--create {
    background: #1c8b6a;
    color: #ffffff;
  }
}
// Animation
.scale-enter-active .inner,
.scale-leave-active .inner {
  transition: all 0.5s ease;
}
.scale-enter-from .inner,
.scale-leave-to .inner {
  opacity: 0;
  transform: scale(0);
}
@media screen and (max-width: $desktop-screen) {
  .signature-board-popup__dialog {
    width: 34.3rem;
    height: 43.7rem;
    padding: 2.4rem 1rem;
  }
}
</style>
