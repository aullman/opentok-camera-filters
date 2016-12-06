require('./capturedImage.css');

module.exports = function captureImage(publisher) {
  const image = document.createElement('img');
  image.setAttribute('src', `data:image/png;base64,${publisher.getImgData()}`);
  image.className = 'capturedImage';
  return image;
};
