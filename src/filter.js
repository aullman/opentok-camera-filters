module.exports = (stream, filterFn) => {
  const canvas = document.createElement('canvas');
  canvas.getContext('2d');  // Necessary or Firefox complains
  let videoElementLoaded = false;
  let selectedFilter;
  let currentFilterFn = filterFn;

  currentFilterFn = filterFn;
  const originalStream = stream;
  const videoElement = document.createElement('video');
  videoElement.srcObject = stream;
  videoElement.setAttribute('playsinline', '');
  videoElement.muted = true;
  setTimeout(() => {
    videoElement.play();
  });

  const setSize = () => {
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
  };

  const loadedMetadata = () => {
    videoElementLoaded = true;
    setSize();

    selectedFilter = currentFilterFn(videoElement, canvas);
  };

  videoElement.addEventListener('loadedmetadata', loadedMetadata);
  videoElement.addEventListener('resize', setSize);

  return {
    canvas,
    setPublisher: function setPublisher(publisher) {
      // We insert the canvas into the publisher element. captureStream() only works
      // with Canvas elements that are visible and in the DOM for Chrome < 52
      // Also for Safari on iOS the video doesn't display the captureStream properly
      // https://bugs.webkit.org/show_bug.cgi?id=181663
      const pubEl = publisher.element;
      let pubVid = pubEl.querySelector('video');
      const setObjectFit = () => {
        pubVid = pubEl.querySelector('.OT_widget-container video');
        pubVid.parentNode.insertBefore(canvas, pubVid);
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.objectFit = window.getComputedStyle(pubVid).objectFit;
      };
      if (!pubVid) {
        publisher.on('videoElementCreated', setObjectFit);
      } else {
        setObjectFit();
      }
      publisher.on('destroyed', this.destroy);
    },
    destroy: () => {
      if (videoElement) {
        videoElement.pause();
        videoElement.removeEventListener('loadedmetadata', loadedMetadata);
      }
      // Stop running the filter
      if (selectedFilter) {
        selectedFilter.stop();
      }
      if (originalStream) {
        if (global.MediaStreamTrack && global.MediaStreamTrack.prototype.stop) {
          // Newer spec
          originalStream.getTracks().forEach((track) => { track.stop(); });
        } else {
          // Older spec
          originalStream.stop();
        }
      }
    },
    change: pFilterFn => {
      currentFilterFn = pFilterFn;
      if (selectedFilter) {
        selectedFilter.stop();
      }
      if (videoElementLoaded) {
        selectedFilter = pFilterFn(videoElement, canvas);
      }
    },
  };
};
