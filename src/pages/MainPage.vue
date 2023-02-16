<template>
  <div class="backdrop">
    <!-- HEADER -->
    <div class="header-wrapper">
      <header class="header" v-if="phase !== 'loading'">
        <img src="../assets/logo.png" />
        <div class="btn-group">
          <button class="history-record--big-screen">歷史紀錄</button>
          <div class="history-record">歷史記錄</div>
        </div>
      </header>
    </div>
    <!-- CONTENT -->
    <div class="content-wrapper">
      <FileUploader
        v-if="phase === 'upload'"
        @file-uploaded="fileUploadedHandler"
      />
      <SignatureBoard
        v-else-if="phase === 'sign'"
        @signature-complete="signatureAppendHandler"
      />
      <TextSpinner v-else-if="phase === 'loading'" :loadingText="loadingText" />
      <FileEditor
        v-else-if="phase === 'edit'"
        v-bind="viewerState"
        v-on="viewerHandlers"
        @signature-deleted="signatureDeleteHandler"
        @new-signature-created="newSignatureCreateHandler"
        @after-download="afterDownloadHandler"
      />
      <FinalStatus v-else-if="phase === 'final'" />
      <canvas ref="offscreenCanvas"></canvas>
    </div>
    <!-- LEAF DECORATION -->
    <div class="leaf-backdrop"></div>
    <!-- FOOTER -->
    <div class="footer-wrapper">
      <footer class="footer">小綠簽 © Code: John / Design: KT</footer>
    </div>
  </div>
</template>

<script setup>
import * as pdfjsLib from "pdfjs-dist/build/pdf.js";
import * as pdfWorker from "pdfjs-dist/build/pdf.worker.entry";
import { fabric } from "fabric";
import FileUploader from "src/components/FileUploader.vue";
import TextSpinner from "src/components/TextSpinner.vue";
import SignatureBoard from "src/components/SignatureBoard.vue";
import FileEditor from "src/components/FileEditor.vue";
import FinalStatus from "src/components/FinalStatus.vue";
import { ref, reactive, onMounted } from "vue";
import { v4 as uuidv4 } from "uuid";
// ======================= DATA =======================
// Constant Variable
const ZOOM_STEP = 0.1;
// State
/**
 * @typedef {"loading" | "upload" | "sign" | "edit" | "final"} Phase
 */
/**
 * Control the phase of business logic
 * @type {Phase}
 */
const phase = ref("upload");
const file = ref(null);
const viewerState = reactive({
  canvasBackgroundImage: null,
  signatureArray: [],
  pageCount: null,
  currentPage: 1,
  zoomLevel: 1,
});
const loadingText = ref(null);
// Reference
const offscreenCanvas = ref(null);
// ======================= HELPERS =======================
/**
 * Promixified version of setTimeout function
 * @param {number} delay the amount of time to wait for in second
 * @return {promise}
 */
const setAsyncTimeout = (delay) =>
  new Promise((resolve) => setTimeout(resolve, delay * 1000));
/**
 * Render the PDF file on the canvas element
 * @param {ArrayBuffer} fileAsArrayBuffer - The PDF file as an array buffer
 * @param {number} [currentPage = 1] - The page number to be rendered.
 */
const renderPdfAndSavePageCount = async (
  fileAsArrayBuffer,
  currentPage = 1,
  zoomLevel = 1
) => {
  // Load PDF document
  const pdfDoc = await pdfjsLib.getDocument(fileAsArrayBuffer).promise;
  // Save the total number count to state variable
  viewerState.pageCount = pdfDoc.numPages;
  // Load the PDF page of our choosing
  const pdfPage = await pdfDoc.getPage(currentPage);
  const viewport = pdfPage.getViewport({ scale: zoomLevel });
  const context = offscreenCanvas.value.getContext("2d");
  offscreenCanvas.value.height = viewport.height;
  offscreenCanvas.value.width = viewport.width;
  const renderContext = {
    canvasContext: context,
    viewport,
  };
  await pdfPage.render(renderContext).promise;
};
/**
 * Load data into an image
 * @param {string} dataUrl - The data URL to be loaded into the image.
 * @return {Promise<Image>} A promise that resolves to the resulting image.
 */
const loadDataToImage = (dataUrl) => {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = function () {
      resolve(this);
    };
    image.src = dataUrl;
  });
};
/**
 * Draw the image on the canvas element
 * @param {HTMLCanvasElement} canvasReference - The canvas element to draw on
 * @param {HTMLImageElement} image - The image to be drawn
 */
const drawImageOnCanvas = (canvasReference, image) => {
  canvasReference.height = image.height;
  canvasReference.width = image.width;
  const context = canvasReference.getContext("2d");
  context.drawImage(image, 0, 0);
};
/**
 * Convert the content rendered on canvas into image
 * @param {HTMLCanvasElement} canvasReference - The canvas to be converted
 * @param {number} [scale = 1] - The scale to apply to the image
 * @return {fabric.Image} the resulting image
 */
const convertToImage = (canvasReference, scale = 1) => {
  return new fabric.Image(canvasReference, {
    id: "renderedPDF",
    scaleX: scale,
    scaleY: scale,
  });
};
/**
 * Render the uploaded file on the canvas and then turn it into an image
 */
const renderFileToImage = () => {
  return new Promise((resolve) => {
    const fileType = file.value.type;
    const isPdfFile = fileType === "application/pdf";
    const reader = new FileReader();
    reader.onload = async function () {
      if (isPdfFile) {
        await renderPdfAndSavePageCount(
          this.result,
          viewerState.currentPage,
          viewerState.zoomLevel
        );
        const pdfImage = await convertToImage(offscreenCanvas.value, 1);
        viewerState.canvasBackgroundImage = pdfImage;
        resolve();
      } else {
        const image = await loadDataToImage(this.result);
        drawImageOnCanvas(offscreenCanvas.value, image);
        const canvasImage = await convertToImage(offscreenCanvas.value, 1);
        viewerState.canvasBackgroundImage = canvasImage;
        resolve();
      }
    };
    if (isPdfFile) {
      reader.readAsArrayBuffer(file.value);
    } else {
      reader.readAsDataURL(file.value);
    }
  });
};
// ======================= METHODS =======================
// Event Handlers
const fileUploadedHandler = async (fileToSave) => {
  phase.value = "loading";
  loadingText.value = "上傳中...";
  file.value = fileToSave;
  await setAsyncTimeout(1);
  phase.value = "sign";
};
const signatureAppendHandler = async (signatureURL) => {
  phase.value = "loading";
  loadingText.value = "簽名優化中...";
  await setAsyncTimeout(1);
  const newSignatureObj = {
    id: uuidv4(),
    dataURL: signatureURL,
  };
  // viewerState.signature = signatureURL;
  viewerState.signatureArray.push(newSignatureObj);
  await renderFileToImage();
  phase.value = "edit";
  loadingText.value = null;
};
const signatureDeleteHandler = (index) => {
  viewerState.signatureArray.splice(index, 1);
};
const newSignatureCreateHandler = (signatureURL) => {
  const newSignatureObj = {
    id: uuidv4(),
    dataURL: signatureURL,
  };
  viewerState.signatureArray.push(newSignatureObj);
};
const afterDownloadHandler = () => {
  phase.value = "final";
};
const viewerHandlers = {
  prevPageClick: () => {
    viewerState.currentPage--;
    renderFileToImage();
  },
  nextPageClick: () => {
    viewerState.currentPage++;
    renderFileToImage();
  },
  zoomInClick: () => {
    viewerState.zoomLevel += ZOOM_STEP;

    renderFileToImage();
  },
  zoomOutClick: () => {
    viewerState.zoomLevel -= ZOOM_STEP;
    renderFileToImage();
  },
};
// ======================= LIFE CYCLES =======================
onMounted(() => {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
});
</script>

<style lang="scss" scoped>
// 1024px
$desktop-screen: 64em;
// 688px
$mobile-screen: 43em;
.backdrop {
  // Avoid Margin collapse due to margin-top from header-wrapper
  overflow: hidden;
  // Proper way to set height and width to 100vh and vw across device width
  position: fixed;
  height: 100%;
  width: 100%;
  // padding: 0 3.8rem;
}
.leaf-backdrop {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-image: url("../assets/leaf-1.png"), url("../assets/leaf-2.png");
  background-repeat: no-repeat;
  background-position: 100% 0, 0 100%;
  pointer-events: none;
}
.header-wrapper {
  // position: absolute;
  margin: 2.8rem 12.2rem 2rem 4rem;
  height: 5.8rem;
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .btn-group {
    margin-right: 2rem;
  }
  .history-record--big-screen {
    // override default styling
    padding: 0;
    border: 2px solid #1c8b6a;
    border-radius: 16px;
    color: #1c8b6a;
    font: inherit;
    background-color: transparent;
    cursor: pointer;
    outline: none;
    height: 4.4rem;
    width: 13.6rem;
  }
  .history-record {
    display: none;
    color: #424242;
    font-size: 1.8rem;
  }
}

.footer-wrapper {
  position: absolute;
  bottom: 1.7rem;
  right: 1.8rem;
  .footer {
    color: #424242;
  }
}
@media (max-width: $desktop-screen) {
  .backdrop {
    background-color: rgba(240, 240, 240, 0.58);
  }
  .header-wrapper {
    position: absolute;
    left: 0;
    right: 0;
    z-index: 1;
    margin: 2.8rem 3.8rem 1.4rem;
    .header {
      max-width: 54.7rem;
      margin: 0 auto;
    }
    .btn-group {
      margin: 0;
      align-self: flex-end;
    }
    .history-record {
      display: block;
    }
    .history-record--big-screen {
      display: none;
    }
  }

  .content-wrapper {
    padding-top: 10.6rem;
    height: 100%;
  }
  .leaf-backdrop {
    display: none;
  }
  .footer-wrapper {
    right: 0;
    left: 0;
    text-align: center;
  }
}
</style>
