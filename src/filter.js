const mockGetUserMedia = require('./mock-get-user-media');

const canvas = document.createElement('canvas');
canvas.getContext('2d');  // Necessary or Firefox complains
let videoElement;
let videoElementLoaded = false;
let selectedFilter;
let initialFilter;

// Mock out getUserMedia and replace the stream with the canvas.captureStream()
mockGetUserMedia(stream => {
  if (!videoElement) {
    videoElement = document.createElement('video');
    // document.body.appendChild(videoElement);
  }
  videoElement.src = URL.createObjectURL(stream);

  videoElement.addEventListener('loadedmetadata', () => {
    videoElement.play();
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    videoElementLoaded = true;
    if (initialFilter) {
      selectedFilter = initialFilter(videoElement, canvas);
    }
  });

  return canvas.captureStream();
});


module.exports = iFilter => {
  initialFilter = iFilter;
  if (videoElementLoaded) {
    selectedFilter = initialFilter(videoElement, canvas);
  }
  return {
    setPublisher: publisher => {
      // We insert the canvas into the publisher element. captureStream() only works
      // with Canvas elements that are visible and in the DOM.
      const pubEl = document.querySelector(`#${publisher.id}`);
      pubEl.appendChild(canvas);
    },
    change: filter => {
      if (selectedFilter) {
        selectedFilter.stop();
      }
      selectedFilter = filter(videoElement, canvas);
    },
  };
};
