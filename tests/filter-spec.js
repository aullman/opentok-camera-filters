/* global describe it expect OT beforeEach */
const filters = require('../src/filters.js');
const filter = require('../src/filter.js')(filters.none);

describe('filter', () => {
  it('defines a setPublisher method', () => {
    expect(filter.setPublisher).toBeDefined();
  });

  it('defines a change method', () => {
    expect(filter.change).toBeDefined();
  });

  describe('OpenTok Publisher', () => {
    beforeEach(done => {
      const script = document.createElement('script');
      script.src = 'https://tbdev.tokbox.com/v2/js/opentok.js';
      script.type = 'text/javascript';
      script.onload = done;
      document.body.appendChild(script);
    });

    it('successfully publishes', done => {
      const publisher = OT.initPublisher(err => {
        expect(err).toBeFalsy();
        done();
      });
      filter.setPublisher(publisher);
    });

    it('lets you change the filter', done => {
      const publisher = OT.initPublisher(err => {
        expect(err).toBeFalsy();
        filter.change(filters.invert);
        filter.change(filters.grayscale);
        done();
      });
      filter.setPublisher(publisher);
    });
  });
});
