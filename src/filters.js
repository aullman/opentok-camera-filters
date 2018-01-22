const tracking = window.tracking = {};
require('tracking/build/tracking');
const filterTask = require('./filterTask');
const clm = require('clmtrackr/clmtrackr.js');
const Tracker = clm.tracker;
const pModel = require('clmtrackr/models/model_pca_20_svm.js');
let ctracker;

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

// Calculate the distance between 2 points
function distance(point1, point2) {
  return Math.sqrt(Math.pow(point2[0] - point1[0], 2) + Math.pow(point2[1] - point1[1], 2));
}

function face(videoElement, canvas, faceFilter) {
  let ctx;
  let stopped = false;

  if (!ctracker) {
    ctracker = new Tracker();
    ctracker.init(pModel);
    ctracker.start(videoElement);
  }

  // Draws a frame on the specified canvas after applying the selected filter every
  // requestAnimationFrame
  const drawFrame = function drawFrame() {
    if (!ctx) {
      ctx = canvas.getContext('2d');
    }
    if (!videoElement.width) {
      // This is a fix for clmtrackr, otherwise it complains about 0 width & height
      videoElement.width = canvas.width; // eslint-disable-line no-param-reassign
      videoElement.height = canvas.height; // eslint-disable-line no-param-reassign
    }
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    if (faceFilter) {
      faceFilter(ctracker.getCurrentPosition());
    } else {
      ctracker.draw(canvas);
    }
    if (!stopped) {
      requestAnimationFrame(drawFrame);
    } else {
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
  grayscale: function grayscale(videoElement, canvas) {
    const filter = imgData => {
      const res = new Uint8ClampedArray(imgData.data.length);
      for (let i = 0; i < imgData.data.length; i += 4) {
        // Using the luminosity algorithm for grayscale 0.21 R + 0.72 G + 0.07 B
        // https://www.johndcook.com/blog/2009/08/24/algorithms-convert-color-grayscale/
        const inputRed = imgData.data[i];
        const inputGreen = imgData.data[i + 1];
        const inputBlue = imgData.data[i + 2];
        res[i] = res[i + 1] = res[i + 2] = Math.round(
          0.21 * inputRed + 0.72 * inputGreen + 0.07 * inputBlue
        );
        res[i + 3] = imgData.data[i + 3];
      }
      return new ImageData(res, imgData.width, imgData.height);
    };
    return filterTask(videoElement, canvas, filter);
  },
  sepia: function sepia(videoElement, canvas) {
    const filter = imgData => {
      const res = new Uint8ClampedArray(imgData.data.length);
      for (let i = 0; i < imgData.data.length; i += 4) {
        // Using the algorithm for sepia from:
        // https://www.techrepublic.com/blog/how-do-i/how-do-i-convert-images-to-grayscale-and-sepia-tone-using-c/
        const inputRed = imgData.data[i];
        const inputGreen = imgData.data[i + 1];
        const inputBlue = imgData.data[i + 2];
        res[i] = Math.round((inputRed * 0.393) + (inputGreen * 0.769) + (inputBlue * 0.189));
        res[i + 1] = Math.round((inputRed * 0.349) + (inputGreen * 0.686) + (inputBlue * 0.168));
        res[i + 2] = Math.round((inputRed * 0.272) + (inputGreen * 0.534) + (inputBlue * 0.131));
        res[i + 3] = imgData.data[i + 3];
      }
      return new ImageData(res, imgData.width, imgData.height);
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
  face,
  glasses: (videoElement, canvas) => {
    let image;
    let ctx;
    return face(videoElement, canvas, positions => {
      if (!ctx) {
        ctx = canvas.getContext('2d');
      }
      if (!image) {
        image = document.createElement('img');
        image.src = 'https://aullman.github.io/opentok-camera-filters/images/comedy-glasses.png';
      }
      if (positions && positions.length > 20) {
        const width = distance(positions[15], positions[19]) * 1.1;
        const height = distance(positions[53], positions[20]) * 1.15;
        const y = positions[20][1] - (0.2 * height);
        const x = positions[19][0];
        // Calculate the angle to draw by looking at the position of the eyes
        // The opposite side is the difference in y
        const opposite = positions[32][1] - positions[27][1];
        // The adjacent side is the difference in x
        const adjacent = positions[32][0] - positions[27][0];
        // tan = opposite / adjacent
        const angle = Math.atan(opposite / adjacent);
        try {
          ctx.translate(x, y);
          ctx.rotate(angle);
          ctx.drawImage(image, 0, 0, width, height);
          ctx.rotate(-angle);
          ctx.translate(-x, -y);
        } catch (err) {
          console.error(err); // eslint-disable-line
        }
      }
    });
  },
};
