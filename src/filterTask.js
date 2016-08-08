module.exports = function filterTask(videoElement, canvas, selectedFilter) {
  let tmpCanvas;
  let tmpCtx;
  let ctx;
  let stopped = false;
  let myId = Math.random() * 1000;

  // Draws a frame on the specified canvas after applying the selected filter every
  // requestAnimationFrame
  const drawFrame = function drawFrame() {
    if (!ctx) {
      ctx = canvas.getContext('2d');
    }
    if (!tmpCanvas) {
      tmpCanvas = document.createElement('canvas');
      tmpCtx = tmpCanvas.getContext('2d');
      tmpCanvas.width = canvas.width;
      tmpCanvas.height = canvas.height;
    }
    tmpCtx.drawImage(videoElement, 0, 0, tmpCanvas.width, tmpCanvas.height);
    const imgData = tmpCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);
    const data = selectedFilter(imgData);
    ctx.putImageData(data, 0, 0);
    if (!stopped) {
      console.log(`requestAnimationFrame ${myId}`);
      requestAnimationFrame(drawFrame);
    } else {
      tmpCanvas = null;
      tmpCtx = null;
      ctx = null;
    }
  };

  requestAnimationFrame(drawFrame);

  return {
    stop: () => {
      stopped = true;
    },
  };
};
