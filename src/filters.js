const tracking = window.tracking = {};
require('tracking/build/tracking');
const filterTask = require('./filterTask');

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

function colourFilter(r, g, b, a, videoElement, canvas) {
  return filterTask(videoElement, canvas, colourShift.bind(this, r, g, b, a));
}

// Filters take a source videoElement and a canvas. The video element contains the users
// camera and the filter function transforms it onto the canvas element provided.
module.exports = {
  none: function none(videoElement, canvas) {
    const filter = imgData => imgData;
    return filterTask(videoElement, canvas, filter);
  },
  red: colourFilter.bind(this, 150, 0, 0, 0),
  green: colourFilter.bind(this, 0, 150, 0, 0),
  blue: colourFilter.bind(this, 0, 0, 150, 0),
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
  sketch: function sketch(videoElement, canvas) {
    const filter = imgData => {
      const sobelData = tracking.Image.sobel(imgData.data, imgData.width, imgData.height);
      return new ImageData(new Uint8ClampedArray(sobelData), imgData.width, imgData.height);
    };
    return filterTask(videoElement, canvas, filter);
  },
  invert: function invert(videoElement, canvas) {
    const filter = imgData => {
      const res = new Uint8ClampedArray(imgData.data.length);
      for (let i = 0; i < imgData.data.length; i += 4) {
        res[i] = 255 - imgData.data[i];
        res[i + 1] = 255 - imgData.data[i + 1];
        res[i + 2] = 255 - imgData.data[i + 2];
        res[i + 3] = imgData.data[i + 3];
      }
      const resData = new ImageData(res, imgData.width, imgData.height);
      return resData;
    };
    return filterTask(videoElement, canvas, filter);
  },
  face: function face(videoElement, canvas, imageSrc) {
    // Draw on the canvas with no filter every requestAnimationFrame
    let tmpCanvas;
    let tmpCtx;
    let image;
    let currentFaces = [];
    let currentMessage;
    let worker;

    const createMessage = function createMessage(dataArray) {
      return {
        array: dataArray,
        width: canvas.width,
        height: canvas.height,
      };
    };

    const filter = imgData => {
      currentMessage = createMessage(imgData.data);
      if (!worker) {
        // We create a worker to detect the faces. We can't send the data
        // for every frame so we just send the most recent frame every time the
        // worker returns
        worker = new Worker('./js/faceWorker.bundle.js');
        worker.addEventListener('message', event => {
          if (event.data.length) {
            currentFaces = event.data;
          } else {
            currentFaces = [];
          }
          if (currentMessage) {
            worker.postMessage(currentMessage);
          }
        });

        worker.postMessage(currentMessage);
      }

      if (!tmpCanvas) {
        tmpCanvas = document.createElement('canvas');
        tmpCtx = tmpCanvas.getContext('2d');
        tmpCanvas.width = canvas.width;
        tmpCanvas.height = canvas.height;
        image = document.createElement('img');
        image.src = imageSrc ||
          'https://aullman.github.io/opentok-camera-filters/images/comedy-glasses.png';
      }
      tmpCtx.putImageData(imgData, 0, 0);

      currentFaces.forEach(rect => {
        tmpCtx.drawImage(image, rect.x, rect.y, rect.width, rect.height);
      });
      return tmpCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);
    };
    return filterTask(videoElement, canvas, filter);
  },
};
