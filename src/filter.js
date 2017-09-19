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
  videoElement.srcObject = stream;
  videoElement.setAttribute('playsinline', '');
  videoElement.muted = true;
  setTimeout(() => {
    videoElement.play();
  });
  const canvasStream = canvas.captureStream();

  videoElement.addEventListener('loadedmetadata', () => {
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    videoElementLoaded = true;

    if (initialFilter) {
      selectedFilter = initialFilter(videoElement, canvas);
    }
  });
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
      const widgetContainer = pubEl.querySelector('.OT_widget-container');
      let pubVid = pubEl.querySelector('.OT_widget-container video');
      widgetContainer.insertBefore(canvas, pubVid);
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      const setObjectFit = () => {
        pubVid = pubEl.querySelector('.OT_widget-container video');
        canvas.style.objectFit = window.getComputedStyle(pubVid).objectFit;
      };
      if (!pubVid) {
        publisher.on('videoElementCreated', setObjectFit);
      } else {
        setObjectFit();
      }
      publisher.on('destroyed', () => {
        // Stop running the filter
        if (selectedFilter) {
          selectedFilter.stop();
        }
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
