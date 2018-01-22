/* global OT config */
// A real app would use require('opentok-filters/src/filters.js');
const filters = require('../../src/filters.js');
// A real app would use require('opentok-filters')(filters.none);
const filterFn = require('../..');
let filter;

const selector = document.querySelector('select');
let f;
for (f of Object.keys(filters)) {
  const option = document.createElement('option');
  option.value = f;
  option.innerHTML = f;
  selector.appendChild(option);
}

selector.addEventListener('change', () => {
  filter.change(filters[selector.value]);
});

const handleError = (err) => {
  if (err) alert(err.message);
};

const publish = OT.getUserMedia().then((mediaStream) => {
  filter = filterFn(mediaStream, filters.none);

  const publisherOptions = {
    // Pass in the canvas stream video track as our custom videoSource
    videoSource: filter.canvas.captureStream(30).getVideoTracks()[0],
    // Pass in the audio track from our underlying mediaStream as the audioSource
    audioSource: mediaStream.getAudioTracks()[0],
  };

  const publisher = OT.initPublisher('publisher', publisherOptions, handleError);
  filter.setPublisher(publisher);

  return publisher;
});

const session = OT.initSession(config.OT_API_KEY, config.OT_SESSION_ID);
session.on('streamCreated', event => {
  session.subscribe(event.stream, handleError);
});

session.connect(config.OT_TOKEN, err => {
  if (err) handleError(err);
  publish.then(publisher => {
    session.publish(publisher, handleError);
  });
});
