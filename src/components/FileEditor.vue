<template>
  <div class="file-editor-container fullscreen">
    <div class="overlay-header">
      <img class="overlay-header__logo" src="../assets/logo.png" />
      <div class="overlay-header__inner-wrapper">
        <!-- Pagination Control -->
        <div class="pagination-control">
          <div class="pagination-control__inner-wrapper">
            <q-btn
              class="pagination-control__prev"
              icon="chevron_left"
              text-color="white"
              dense
              @click.prevent="handlePrevBtnClick"
            />
            <div class="pagination-control__page-indicator">
              {{ currentPage }}&nbsp;&nbsp;/&nbsp;&nbsp;{{ pageCount }}
            </div>
            <q-btn
              class="pagination-control__next"
              icon="chevron_right"
              text-color="white"
              dense
              @click.prevent="handleNextBtnClick"
            />
          </div>
        </div>
        <!-- Action Button -->
        <q-btn
          :label="action"
          class="action-btn"
          @click.prevent="toggleAction"
        />
      </div>
    </div>
    <div class="content-wrapper">
      <div class="viewer">
        <div class="viewer__inner">
          <canvas class="viewer__canvas" ref="canvas"> </canvas>
        </div>
      </div>
    </div>
    <div class="bottom-bar">
      <div class="bottom-bar__inner-wrapper">
        <!-- Pagination Control -->
        <div class="pagination-control">
          <div class="pagination-control__inner-wrapper">
            <q-btn
              class="pagination-control__prev"
              icon="chevron_left"
              text-color="white"
              dense
              @click.prevent="handlePrevBtnClick"
            />
            <div class="pagination-control__page-indicator">
              {{ currentPage }}&nbsp;&nbsp;/&nbsp;&nbsp;{{ pageCount }}
            </div>
            <q-btn
              class="pagination-control__next"
              icon="chevron_right"
              text-color="white"
              dense
              @click.prevent="handleNextBtnClick"
            />
          </div>
        </div>
        <!-- Zoom Control -->
        <div class="zoom-control">
          <div class="zoom-control__inner-wrapper">
            <q-btn
              class="zoom-control__zoom-in"
              :icon="`img:${require('../assets/svg/zoom-in.svg')}`"
              dense
              unelevated
              @click.prevent="handleZoomOut"
            />
            <div class="zoom-control__percentage-indicator">
              {{ zoomLevelPercentage }}%
            </div>
            <q-btn
              class="zoom-control__zoom-out"
              :icon="`img:${require('../assets/svg/zoom-out.svg')}`"
              dense
              unelevated
              @click.prevent="handleZoomIn"
            />
          </div>
        </div>
        <!-- Tool Box -->
        <div class="tool-box">
          <div class="tool-box__inner-wrapper">
            <div
              class="tool-box__frame"
              v-for="{ toolName, svg, text, clickHandler } in toolsArray"
              :key="toolName"
            >
              <q-btn
                class="tool-box__btn"
                :icon="`img:${require(`../assets/svg/${svg}.svg`)}`"
                padding="1rem"
                dense
                unelevated
                @click.prevent="clickHandler"
              />
              <span class="tool-box__text">{{ text }}</span>
            </div>
          </div>
        </div>
        <!-- Action Button -->
        <q-btn
          :label="action"
          class="action-btn"
          @click.prevent="toggleAction"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  toRefs,
  onMounted,
  watch,
  computed,
  useAttrs,
  defineEmits,
} from "vue";
import { fabric } from "fabric"; // to wrap the HTML canvas element up with
import { jsPDF } from "jspdf"; // For downloading the merged pdf file
// ======================= ATTRS =======================
const attrs = useAttrs();
const { canvasBackgroundImage, signature, pageCount, currentPage, zoomLevel } =
  toRefs(attrs);
// ======================= EMITS =======================
const emit = defineEmits([
  "prevPageClick",
  "nextPageClick",
  "zoomInClick",
  "zoomOutClick",
]);
// ======================= GETTER =======================
const zoomLevelPercentage = computed(() => (zoomLevel.value * 100).toFixed(0)); // Deal with floating point number
// ======================= DATA =======================
// Static
const toolsArray = [
  {
    toolName: "sign",
    svg: "sign",
    text: "簽名",
    clickHandler: () => handleAppendSignature(),
  },
  {
    toolName: "check",
    svg: "check",
    text: "勾選",
    clickHandler: () => handleAppendCheckMark(),
  },
  {
    toolName: "date",
    svg: "date",
    text: "日期",
    clickHandler: () => handleAppendDate(),
  },
  {
    toolName: "text",
    svg: "text",
    text: "插入文字",
    clickHandler: () => handleAppendText(),
  },
];
// State
/**
 * @typedef {"完成簽署" | "儲存"} Action
 */
/**
 * Control the main action of the button
 * @type {Action}
 */
const action = ref("完成簽署");
// Reference
const canvas = ref(null);
let fabricCanvas = null;
// ======================= METHODS =======================
// Helpers
/**
 * Set the canvas background Image with the provided one
 * @param {fabric.Canvas} fabricCanvasObj - The instance of the fabric.Canvas object to mount the image on
 * @param {fabric.Image} backgroundImage - The fabric.image instance to set the background of the canvas as
 */
const setCanvasBackgroundImage = (fabricCanvasObj, backgroundImage) => {
  fabricCanvasObj.requestRenderAll();
  fabricCanvasObj.setWidth(backgroundImage.width);
  fabricCanvasObj.setHeight(backgroundImage.height);
  fabricCanvasObj.setBackgroundImage(
    backgroundImage,
    fabricCanvasObj.renderAll.bind(fabricCanvasObj)
  );
};
/**
 * Set the "aspect ratio" of the background image on the canvas element
   for responsive design at breakpoint "688px"(mobile)
 * @param {fabric.Image} backgroundImage - The fabric.image instance to set the background of the canvas as
 */
const setAspectRatioOnCanvas = (backgroundImage) => {
  const aspectRatio = (backgroundImage.width / backgroundImage.height).toFixed(
    2
  );
  document.querySelectorAll("viewer__canvas").forEach((ele) => {
    ele.style.setProperty("aspect-ratio", aspectRatio);
  });
};
const getViewportWidth = () => {
  console.log(
    "clientWidth",
    document.documentElement.clientWidth,
    "innerWidth",
    window.innerWidth
  );
  return Math.max(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0
  );
};
/**
 * Get the current date in the format 'yyyy/mm/dd'
 * @return {string} - The formatted current date string
 */
const getCurrentDate = () => {
  const date = new Date();
  const localDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const formattedDate = localDate.replace(/(\d+)\/(\d+)\/(\d+)/, "$3/$1/$2");
  getViewportWidth();
  return formattedDate;
};
/**
 * Insert the text on the canvas wrapper
 * @param {string} text - the text string to insert
 */
const insertTextOnCanvas = (text) => {
  const textToAdd = new fabric.Text(text, {
    top: 0,
    left: 0,
    scaleX: 1,
    scaleY: 1,
    fontSize: 24,
  });
  fabricCanvas.add(textToAdd);
};
// Handlers
const actionHandlers = {
  完成簽署: () => {
    fabricCanvas.forEachObject((obj) => {
      obj.selectable = false;
      obj.hoverCursor = "default";
    });
    fabricCanvas.renderAll();
    action.value = "儲存";
  },
  儲存: () => {
    const newPDF = new jsPDF();
    const image = fabricCanvas.toDataURL("image/png");
    const width = newPDF.internal.pageSize.width;
    const height = newPDF.internal.pageSize.height;
    newPDF.addImage(image, "png", 0, 0, width, height);
    newPDF.save("download.pdf");
    // Redirect the user to another component
  },
};
const toggleAction = () => {
  actionHandlers[action.value]();
};
const handlePrevBtnClick = () => {
  // Guard Clause
  if (currentPage.value === 1) return;
  emit("prevPageClick");
};
const handleNextBtnClick = () => {
  // Guard Clause
  if (currentPage.value === pageCount.value) return;
  emit("nextPageClick");
};
const handleZoomOut = () => {
  // Guard Clause
  if (zoomLevel.value <= 0.6) return; // Set the lower limit to 0.5(floating point number)
  emit("zoomOutClick");
};
const handleZoomIn = () => {
  // Guard Clause
  if (zoomLevel.value >= 2) return; // Set the upper limit to 2(floating point number)
  emit("zoomInClick");
};
const handleAppendSignature = () => {
  fabric.Image.fromURL(signature.value, (img) => {
    img.top = 0;
    img.left = 0;
    img.scaleX = 1;
    img.scaleY = 1;
    fabricCanvas.add(img);
  });
};
const handleAppendCheckMark = () => {
  const checkMark = "\u2713";
  insertTextOnCanvas(checkMark);
};
const handleAppendDate = () => {
  const currentDateStr = getCurrentDate();
  insertTextOnCanvas(currentDateStr);
};
const handleAppendText = () => {
  const textBox = new fabric.Textbox("請輸入文字", {
    width: 200,
    fontSize: 24,
  });
  fabricCanvas.add(textBox);
};
// ======================= LIFE CYCLE HOOKS =======================
onMounted(() => {
  if (canvas.value) fabricCanvas = new fabric.Canvas(canvas.value);
  setCanvasBackgroundImage(fabricCanvas, canvasBackgroundImage.value);
  setAspectRatioOnCanvas(canvasBackgroundImage.value);
});
// ======================= WATCHER =======================
// For handling page update from pagination
watch(canvasBackgroundImage, (newBackground, _) => {
  setCanvasBackgroundImage(fabricCanvas, newBackground);
  setAspectRatioOnCanvas(canvasBackgroundImage.value);
});
</script>

<style lang="scss" scoped>
// 1024px
$desktop-screen: 64em;
// 688px
$mobile-screen: 43em;
.file-editor-container {
  // position: fixed;
  // top: 0;
  // left: 0;
  // z-index: 1;
  // height: 100vh;
  // width: 100%;
  background-color: #f0f0f0;
}
.overlay-header {
  display: inline-block;
  width: fit-content;
  position: absolute;
  top: 2.8rem;
  left: 4rem;
  &__logo {
    display: block;
  }
  &__inner-wrapper {
    display: none;
  }
}
.content-wrapper {
  height: calc(100% - 8.3rem);
  overflow-y: auto;
  overflow-x: auto;
}
.viewer {
  height: auto;
  &__inner {
    margin: 2rem auto;
    padding: 0 14rem;
    // display: flex;
    // justify-content: center;
    // To keep the canvas from overflowing
    width: fit-content;
  }
}
.bottom-bar {
  display: block;
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  background-color: #ffffff;
  &__inner-wrapper {
    padding: 1rem 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
}
.pagination-control {
  display: inline-block;
  margin: 0 1rem;
  box-shadow: 1px 4px 6px rgba(0, 0, 0, 0.11);
  background-color: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  &__inner-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 3.3rem;
    padding: 14px 16px;
  }
  &__prev,
  &__next {
    width: 3rem;
    height: 3rem;
    background-color: #1c8b6a;
    border-radius: 12px;
  }
  &__page-indicator {
    font-weight: 400;
    font-size: 1.6rem;
    line-height: 19px;
  }
}
.zoom-control {
  display: inline-block;
  margin: 0 1rem;
  box-shadow: 1px 4px 6px rgba(0, 0, 0, 0.11);
  border-radius: 16px;
  overflow: hidden;
  &__inner-wrapper {
    display: flex;
    align-items: center;
    gap: 3.3rem;
    padding: 14px 16px;
  }
  &__zoom-in,
  &__zoom-out {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
  }
  &__percentage-indicator {
    font-weight: 400;
    font-size: 1.6rem;
    line-height: 19px;
  }
}
.tool-box {
  display: inline-flex;
  // margin: 0 5.5rem;
  // Ghost spacer div
  &::before,
  &::after {
    content: "";
    display: inline-block;
    max-width: 5.5rem;
    width: calc(
      25 / 256 * 100vw - 70px
    ); // keep the margin between 55px and 30px
  }
  &__inner-wrapper {
    display: inline-flex;
    gap: 2.4rem;
  }
  &__frame {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2px;
  }
  &__btn {
    background: linear-gradient(180deg, #35a483 0%, #077854 100%);
    border-radius: 9px;
  }
  &__text {
    font-weight: 400;
    font-size: 12px;
    line-height: 17px;
    color: #1c8b6a;
  }
}
.action-btn {
  color: white;
  font-weight: 400;
  font-size: 1.8rem;
  line-height: 27px;
  background: linear-gradient(180deg, #35a483 0%, #077854 100%);
  border-radius: 14px;
  margin: 0 4rem;
  padding: 1.45rem 5.5rem;
}

@media (max-width: $desktop-screen) {
  $HEADER_MARGIN_X: 1.6rem;
  $HEADER_MARGIN_Y: 1.6rem;
  $HEADER_HEIGHT: 5.8rem;
  $BOTTOM_BAR_MARGIN_Y: 2.4rem;
  $BOTTOM_BAR_MARGIN_X: 1.6rem;
  $BOTTOM_BAR_HEIGHT: 8.3rem;
  .overlay-header {
    display: block;
    width: auto;
    position: relative;
    top: 0;
    left: 0;
    margin: $HEADER_MARGIN_Y $HEADER_MARGIN_X;
    &__logo {
      display: none;
    }
    &__inner-wrapper {
      display: flex;
      gap: 1rem;
    }
    .pagination-control {
      margin: 0;
      flex: 1;
    }
  }

  .viewer {
    &__inner {
      padding: 0;
      margin: 0 auto;
    }
  }
  .content-wrapper {
    height: calc(
      100% - #{$BOTTOM_BAR_HEIGHT} - #{$BOTTOM_BAR_MARGIN_Y} * 2 - #{$HEADER_HEIGHT} -
        #{$HEADER_MARGIN_Y} * 2
    ); // take off overlay-header and bottom-bar(including margin)
  }
  .action-btn {
    margin: 0;
  }
  .bottom-bar {
    border-radius: 16px;
    bottom: $BOTTOM_BAR_MARGIN_Y;
    left: $BOTTOM_BAR_MARGIN_X;
    right: $BOTTOM_BAR_MARGIN_X;
    width: auto;
    // position: relative;
    // bottom: 0;
    // left: 0;
    // margin: 2.4rem 1.6rem;
    &__inner-wrapper {
      justify-content: center;
    }
    .pagination-control {
      display: none;
    }
    .zoom-control {
      display: none;
    }
    .action-btn {
      display: none;
    }
  }
}
@media (max-width: $mobile-screen) {
  .content-wrapper {
    margin: 0 1.6rem;
  }
  .viewer {
    &__inner {
      width: 100%;
    }
  }
  :deep(.canvas-container) {
    width: 100% !important;
    height: auto !important; // Decided by its child element
  }
  :deep(.upper-canvas) {
    width: 100% !important;
    height: auto !important; // Adjusted based on aspect ratio set by JavaScript
  }
  :deep(.lower-canvas) {
    width: 100% !important;
    height: auto !important; // Adjusted based on aspect ratio set by JavaScript
  }
  .action-btn {
    padding: 1.45rem 2.9rem;
  }
}
</style>
