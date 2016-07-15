/* global OT */
const filters = require('opentok-camera-filters/src/filters.js');
const filter = require('opentok-camera-filters')(filters.none);

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
    '2_MX4xMTI3fn4xNDY4NTU5MDM0ODY3fjFVbG9QTWlNWHJNcFE2ZThUempHdXhsK35-');
  session.on('streamCreated', event => {
    session.subscribe(event.stream, err => {
      if (err) alert(err.message);
    });
  });

  session.connect('T1==cGFydG5lcl9pZD0xMTI3JnNpZz1iNzQyM2Q4YjkyZWU2MGE5Yzg2YmM1YTZhMjdjMzJlOTI4' +
    'ZjI0ZmIyOnNlc3Npb25faWQ9Ml9NWDR4TVRJM2ZuNHhORFk0TlRVNU1ETTBPRFkzZmpGVmJHOVFUV2xOV0hKTmNGRT' +
    'JaVGhVZW1wSGRYaHNLMzUtJmNyZWF0ZV90aW1lPTE0Njg1NTkwMzUmbm9uY2U9MC4wMDY5MDA4Mzc4Nzc3NjUyOTgm' +
    'cm9sZT1tb2RlcmF0b3ImZXhwaXJlX3RpbWU9MTQ3MTE1MTAzNQ==', err => {
    if (err) alert(err.message);
    const publisher = session.publish(null, {
      resolution: '320x240',
    });
    filter.setPublisher(publisher);
  });
});
