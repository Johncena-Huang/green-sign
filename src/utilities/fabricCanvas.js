import { fabric } from "fabric"; // to wrap the HTML canvas element up with
/**
 * A wrapper class for the Fabric.js canvas element.
 * @class
 * @param {HTMLElement} canvasElement - The canvas element to be wrapped by Fabric.js.
 * @param {HTMLImageElement} image - The background image for the canvas.
 */
class FabricCanvas {
  constructor(canvasElement, image) {
    this.canvas = new fabric.Canvas(canvasElement, {
      allowTouchScrolling: true,
    });
    // Init
    this._updateFabricCanvasPackage();
    this._appendDefaultDeleteBtnToCanvasElement();
    this._customizeCanvasControlsStyle();
    this._observe();
    this.setBackgroundImage(image);
    this.setAspectRatioOnCanvas(image, "viewer__canvas");
  }
  _updateFabricCanvasPackage() {
    var addListener = fabric.util.addListener,
      removeListener = fabric.util.removeListener,
      addEventOptions = { passive: false };
    fabric.Canvas.prototype._onTouchStart = function (e) {
      // e.preventDefault();
      !this.allowTouchScrolling && e.preventDefault && e.preventDefault();
      if (this.mainTouchId === null) {
        this.mainTouchId = this.getPointerId(e);
      }
      this.__onMouseDown(e);
      this._resetTransformEventData();
      var canvasElement = this.upperCanvasEl,
        eventTypePrefix = this._getEventPrefix();
      addListener(
        fabric.document,
        "touchend",
        this._onTouchEnd,
        addEventOptions
      );
      addListener(
        fabric.document,
        "touchmove",
        this._onMouseMove,
        addEventOptions
      );
      // Unbind mousedown to prevent double triggers from touch devices
      removeListener(
        canvasElement,
        eventTypePrefix + "down",
        this._onMouseDown
      );
    };
  }
  _observe() {
    this.canvas.on("selection:created", function () {
      this.allowTouchScrolling = false;
    });
    this.canvas.on("selection:cleared", function () {
      this.allowTouchScrolling = true;
    });
  }
  setBackgroundImage(image) {
    this.canvas.requestRenderAll();
    this.canvas.setWidth(image.width);
    this.canvas.setHeight(image.height);
    this.canvas.setBackgroundImage(
      image,
      this.canvas.renderAll.bind(this.canvas)
    );
  }
  setAspectRatioOnCanvas(backgroundImage, elementClassName) {
    const aspectRatio = (
      backgroundImage.width / backgroundImage.height
    ).toFixed(2);
    document.querySelectorAll(elementClassName).forEach((ele) => {
      ele.style.setProperty("aspect-ratio", aspectRatio);
    });
  }
  appendSignature(signature) {
    fabric.Image.fromURL(signature, (img) => {
      img.top = 0;
      img.left = 0;
      img.scaleX = 1;
      img.scaleY = 1;
      this.canvas.add(img);
    });
  }
  appendText(text) {
    const textToAdd = new fabric.Text(text, {
      top: 0,
      left: 0,
      scaleX: 1,
      scaleY: 1,
      fontSize: 24,
    });
    this.canvas.add(textToAdd);
  }
  fixCanvas() {
    this.canvas.forEachObject((obj) => {
      obj.selectable = false;
      obj.hoverCursor = "default";
    });
    this.canvas.renderAll();
  }
  convertToImage() {
    return this.canvas.toDataURL();
  }
  _customizeCanvasControlsStyle() {
    const canvasControlsOption = {
      tl: false,
      tr: true,
      bl: true,
      br: true,
      ml: false,
      mt: false,
      mr: false,
      mb: false,
      mtr: false,
    };
    fabric.Object.prototype.set({
      borderColor: "rgba(12, 140, 233, 1)",
      cornerColor: "rgba(12, 140, 233, 1)",
      cornerStyle: "rect",
      cornerSize: "5",
    });
    fabric.Object.prototype.setControlsVisibility(canvasControlsOption);
  }
  _appendDefaultDeleteBtnToCanvasElement() {
    function deleteObject(eventData, transform) {
      const target = transform.target;
      const canvas = target.canvas;
      canvas.remove(target);
      canvas.requestRenderAll();
    }
    function renderIcon(ctx, left, top, styleOverride, fabricObject) {
      const size = this.cornerSize;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
      ctx.drawImage(deleteImg, -size / 2, -size / 2, size, size);
      ctx.restore();
    }
    const deleteImg = new Image();
    deleteImg.onload = () => {
      fabric.Object.prototype.controls.deleteControl = new fabric.Control({
        x: -0.5,
        y: -0.5,
        offsetY: 0,
        cursorStyle: "pointer",
        mouseUpHandler: deleteObject,
        render: renderIcon,
        cornerSize: 24,
      });
    };
    deleteImg.src = require("../assets/svg/icon-delete.svg");
  }
}
export default FabricCanvas;
