/* global OT config */
// A real app would use require('opentok-filters/src/filters.js');
const filters = require('../../src/filters.js');
// A real app would use require('opentok-filters')(filters.none);
const filter = require('../..')(filters.none);

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
  const session = OT.initSession(config.OT_API_KEY, config.OT_SESSION_ID);
  session.on('streamCreated', event => {
    session.subscribe(event.stream, err => {
      if (err) alert(err.message);
    });
  });

  session.connect(config.OT_TOKEN, err => {
    if (err) alert(err.message);
    const publisher = session.publish(null, {
      resolution: '320x240',
    });
    filter.setPublisher(publisher);
  });
});
