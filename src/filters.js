const tracking = window.tracking = {};
require('tracking/build/tracking');
require('tracking/build/data/face');

function colourShift(r, g, b, a, imgData) {
  const res = new Uint8ClampedArray(imgData.data.length);
  for (let i = 0; i < imgData.data.length; i += 4) {
    res[i] = Math.min(255, imgData.data[i] + r);
    res[i + 1] = Math.max(0, Math.min(255, imgData.data[i + 1] + g));
    res[i + 2] = Math.max(0, Math.min(255, imgData.data[i + 2] + b));
    res[i + 3] = Math.max(0, Math.min(255, imgData.data[i + 3] + a));
  }
  const resData = new ImageData(res, imgData.width, imgData.height);
  return resData;
}

function filterTask(videoElement, canvas, selectedFilter) {
  let tmpCanvas;
  let tmpCtx;
  let ctx;
  let stopped = false;

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
}

function colourFilter(r, g, b, a, videoElement, canvas) {
  return filterTask(videoElement, canvas, colourShift.bind(this, r, g, b, a));
}

// let objectTracker;

// Filters take a source videoElement and a canvas. The video element contains the users
// camera and the filter function transforms it onto the canvas element provided.
module.exports = {
  red: colourFilter.bind(this, 100, 0, 0, 0),
  green: colourFilter.bind(this, 0, 100, 0, 0),
  blue: colourFilter.bind(this, 0, 0, 100, 0),
  grayscale: function grayscale(videoElement, canvas) {
    const filter = imgData => {
      const grayData = tracking.Image.grayscale(imgData.data, imgData.width, imgData.height, true);
      return new ImageData(grayData, imgData.width, imgData.height);
    };

    return filterTask(videoElement, canvas, filter);
  },
  blur: function blur(videoElement, canvas) {
    const filter = imgData => {
      const blurData = tracking.Image.blur(imgData.data, imgData.width, imgData.height, 50);
      return new ImageData(new Uint8ClampedArray(blurData), imgData.width, imgData.height);
    };
    return filterTask(videoElement, canvas, filter);
  },
  sobel: function sobel(videoElement, canvas) {
    const filter = imgData => {
      const sobelData = tracking.Image.sobel(imgData.data, imgData.width, imgData.height);
      return new ImageData(new Uint8ClampedArray(sobelData), imgData.width, imgData.height);
    };
    return filterTask(videoElement, canvas, filter);
  },
  face: function face(videoElement, canvas) {
    const faceTracker = new tracking.ObjectTracker(['face']);
    faceTracker.setInitialScale(4);
    faceTracker.setStepSize(2);
    faceTracker.setEdgesDensity(0.1);
    let currentFaces = [];
    faceTracker.on('track', event => {
      // When we detect faces we store them and draw them later
      if (event.data.length) {
        currentFaces = event.data;
      } else {
        currentFaces = [];
      }
    });

    // Draw on the canvas with no filter every requestAnimationFrame
    let tmpCanvas;
    let tmpCtx;
    let image;
    const filter = imgData => {
      faceTracker.track(imgData.data, canvas.width, canvas.height);
      if (!tmpCanvas) {
        tmpCanvas = document.createElement('canvas');
        tmpCtx = tmpCanvas.getContext('2d');
        tmpCanvas.width = canvas.width;
        tmpCanvas.height = canvas.height;
        image = document.createElement('img');
        image.src = '/images/comedy-glasses.png';
      }
      tmpCtx.putImageData(imgData, 0, 0);

      currentFaces.forEach(rect => {
        tmpCtx.drawImage(image, rect.x, rect.y, rect.width, rect.height);
      });
      const imgData2 = tmpCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);
      return imgData2;
    };
    const task = filterTask(videoElement, canvas, filter);

    return {
      stop: () => {
        task.stop();
      },
    };
  },
};
