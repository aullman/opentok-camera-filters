/* global OT */
const filters = require('./filters');
const filter = require('./filter')(filters.none);

const selector = document.createElement('select');
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

document.body.appendChild(selector);


// Wait for OT to load before we start using it
window.addEventListener('load', () => {
  // Simple Hello World App
  const session = OT.initSession('1127',
    '1_MX4xMTI3fn4xNDY2Mzg4MzI1MjQ0fnVnSGFGYm1TS3VmaitVM0lOdEYrYjVHUX5-');
  session.on('streamCreated', event => {
    session.subscribe(event.stream, err => {
      if (err) alert(err.message);
    });
  });

  session.connect('T1==cGFydG5lcl9pZD0xMTI3JnNpZz1mMWVkMDYyMjlkMDdmODVkNmZkYzQwY2M1MGEyMmY1MzdmM' +
    'zQ2NGNhOnNlc3Npb25faWQ9MV9NWDR4TVRJM2ZuNHhORFkyTXpnNE16STFNalEwZm5WblNHRkdZbTFUUzNWbWFpdFZN' +
    'MGxPZEVZcllqVkhVWDUtJmNyZWF0ZV90aW1lPTE0NjYzODgzMjUmbm9uY2U9MC40ODk2MTM1ODI4NDU3NzczJnJvbGU' +
    '9bW9kZXJhdG9yJmV4cGlyZV90aW1lPTE0Njg5ODAzMjU=', err => {
    if (err) alert(err.message);
    const publisher = session.publish(null, {
      resolution: '320x240',
    });
    filter.setPublisher(publisher);
  });
});
