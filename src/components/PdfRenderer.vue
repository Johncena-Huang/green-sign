<template>
  <div>Upload the file</div>
  <div>
    Upload pdf file<input
      accept="image/*,application/pdf"
      ref="uploaderRef"
      type="file"
      @change.prevent="handleFileUploaded"
    />
  </div>
  <div>Preview section</div>
  <canvas ref="canvasRef"></canvas>
  <div><canvas ref="canvasBackground" class="hidden"></canvas></div>
  <div><button>Export   </button></div>
</template>

<script setup>
import { shallowRef, onMounted } from "vue";
import { fabric } from "fabric";
import * as pdfjsLib from "pdfjs-dist/build/pdf.js";
import * as pdfWorker from "pdfjs-dist/build/pdf.worker.entry";
onMounted(() => {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
  //   if (canvasRef.value) canvasContext.value = canvasRef.value.getContext("2d");
  if (canvasRef.value) canvasRef.value = new fabric.Canvas(canvasRef.value);
});
console.log(pdfjsLib);
const canvasBackground = shallowRef(null);
const uploaderRef = shallowRef(null);
const canvasRef = shallowRef(null);
const canvasContext = shallowRef(null);
const renderPDF = async (fileAsArrayBuffer, pageNumber) => {
  //   const pdfDoc = await pdfjsLib.getDocument(fileAsArrayBuffer).promise;
  //   const pdfPage = await pdfDoc.getPage(pageNumber);
  //   const viewport = pdfPage.getViewport({ scale: 1 });
  //   canvasRef.value.height = viewport.height;
  //   canvasRef.value.width = viewport.width;
  //   const renderContext = {
  //     canvasContext: canvasContext.value,
  //     viewport: viewport,
  //   };
  //   const renderTask = await pdfPage.render(renderContext).promise;
  //   console.log("Page rendered");
  const pdfDoc = await await pdfjsLib.getDocument(fileAsArrayBuffer).promise;
  const pdfPage = await pdfDoc.getPage(pageNumber);
  const viewport = pdfPage.getViewport({ scale: 1 });
  const context = canvasBackground.value.getContext("2d");
  canvasBackground.value.height = viewport.height;
  canvasBackground.value.width = viewport.width;
  const renderContext = {
    canvasContext: context,
    viewport,
  };
  await pdfPage.render(renderContext).promise;
};
const loadImage = (src) => {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = function () {
      resolve(this);
    };
    image.src = src;
  });
};
const canvasToImage = (pdfOnCanvasData) => {
  return new fabric.Image(pdfOnCanvasData, {
    id: "renderedPDF",
    scaleX: 1,
    scaleY: 1,
  });
};
const drawImageOnCanvas = (image) => {
  canvasBackground.value.height = image.height;
  canvasBackground.value.width = image.width;
  const context = canvasBackground.value.getContext("2d");
  context.drawImage(image, 0, 0);
};
const handleFileUploaded = (e) => {
  const file = e.target.files[0];
  const fileType = file.type;
  if (fileType === "application/pdf") {
    const reader = new FileReader();
    reader.onload = async function () {
      // we are merging two canvas elements together
      // by turning one into image and setting it as the
      // background of the other canvas element.
      canvasRef.value.requestRenderAll();
      // 1. Render the pdf content on the canvas 2
      await renderPDF(this.result, 1);
      // 2. Convert the canvas 2 with pdf content into image
      const pdfImage = await canvasToImage(canvasBackground.value);
      canvasRef.value.setWidth(pdfImage.width);
      canvasRef.value.setHeight(pdfImage.height);
      // 3. Set the image as the background of canvas 1
      canvasRef.value.setBackgroundImage(
        pdfImage,
        canvasRef.value.renderAll.bind(canvasRef.value)
      );
    };
    reader.readAsArrayBuffer(file);
  } else {
    const reader = new FileReader();
    reader.onload = async function () {
      canvasRef.value.requestRenderAll();
      // pass in the data URL to image and load it up
      const image = await loadImage(this.result);
      drawImageOnCanvas(image);
      const pdfImage = await canvasToImage(canvasBackground.value);
      canvasRef.value.setWidth(pdfImage.width);
      canvasRef.value.setHeight(pdfImage.height);
      canvasRef.value.setBackgroundImage(
        pdfImage,
        canvasRef.value.renderAll.bind(canvasRef.value)
      );
    };
    reader.readAsDataURL(file);
  }
};
</script>

<style lang="scss" scoped></style>
