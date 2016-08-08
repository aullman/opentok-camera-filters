const mockGetUserMedia = require('./mock-get-user-media');

const canvas = document.createElement('canvas');
canvas.getContext('2d');  // Necessary or Firefox complains
let videoElement;
let videoElementLoaded = false;
let selectedFilter;
let initialFilter;

// Mock out getUserMedia and replace the stream with the canvas.captureStream()
mockGetUserMedia(stream => {
  videoElement = document.createElement('video');
  videoElement.muted = 'true';
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

  const canvasStream = canvas.captureStream();
  if (stream.getAudioTracks().length) {
    // Add the audio track to the stream
    // This actually doesn't work in Firefox until version 49
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1271669
    canvasStream.addTrack(stream.getAudioTracks()[0]);
  }
  return canvasStream;
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
      publisher.on('destroyed', () => {
        // Stop running the filter
        selectedFilter.stop();
      });
    },
    change: filter => {
      if (selectedFilter) {
        selectedFilter.stop();
      }
      selectedFilter = filter(videoElement, canvas);
    },
  };
};
