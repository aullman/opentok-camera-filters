self.window = self;
const tracking = window.tracking = {};
require('tracking/build/tracking');
require('tracking/build/data/face');

let faceTracker;

self.addEventListener('message', event => {
  const arr = new Uint8ClampedArray(event.data.array);

  if (!faceTracker) {
    faceTracker = new tracking.ObjectTracker(['face']);
    faceTracker.setInitialScale(4);
    faceTracker.setStepSize(2);
    faceTracker.setEdgesDensity(0.1);
  }
  faceTracker.once('track', faceEvent => {
    self.postMessage(faceEvent.data);
  });
  faceTracker.track(arr, event.data.width, event.data.height);
});
