module.exports = function colourShift(imgData, r = 0, g = 0, b = 0, a = 0) {
  return new Promise(resolve => {
    const res = new Uint8ClampedArray(imgData.data.length);
    for (let i = 0; i < imgData.data.length; i += 4) {
      res[i] = Math.min(255, imgData.data[i] + r);
      res[i + 1] = Math.max(0, Math.min(255, imgData.data[i + 1] + g));
      res[i + 2] = Math.max(0, Math.min(255, imgData.data[i + 2] + b));
      res[i + 3] = Math.max(0, Math.min(255, imgData.data[i + 3] + a));
    }
    const resData = new ImageData(res, imgData.width, imgData.height);
    resolve(resData);
  });
};
