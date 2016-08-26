/* global OT */
const filters = require('../opentok-camera-filters/src/filters.js');
const filter = require('../opentok-camera-filters')(filters.none);

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


// Wait for OT to load before we start using it
window.addEventListener('load', () => {
  // Simple Hello World App
  const session = OT.initSession('1127',
    '2_MX4xMTI3fn4xNDcyMTcxNjQxMDc2fkpNc1N0cDRCdzIwQXdidkhGVEZickpDMX5-');
  session.on('streamCreated', event => {
    session.subscribe(event.stream, err => {
      if (err) alert(err.message);
    });
  });

  session.connect('T1==cGFydG5lcl9pZD0xMTI3JnNpZz1mMzAyMTc0N2NjMTA3YjZkZWYzOGI1Y2VmOGI0OWM2MjFlMWQ4YWM0OnNlc3Npb25faWQ9Ml9NWDR4TVRJM2ZuNHhORGN5TVRjeE5qUXhNRGMyZmtwTmMxTjBjRFJDZHpJd1FYZGlka2hHVkVaaWNrcERNWDUtJmNyZWF0ZV90aW1lPTE0NzIxNzE2NDEmbm9uY2U9MC41OTQzMTAwNDI5ODc2Mjg3JnJvbGU9bW9kZXJhdG9yJmV4cGlyZV90aW1lPTE0NzQ3NjM2NDE=', err => {
    if (err) alert(err.message);
    const publisher = session.publish(null, {
      resolution: '320x240',
    });
    filter.setPublisher(publisher);
  });
});
