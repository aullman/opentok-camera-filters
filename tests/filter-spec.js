/* global describe it expect OT beforeEach SESSION_ID TOKEN API_KEY jasmine spyOn */
const filters = require('../src/filters.js');
const filter = require('../src/filter.js')(filters.none);
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

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

    it('stops drawing frames when the publisher is destroyed', done => {
      spyOn(window, 'requestAnimationFrame').and.callThrough();
      const publisher = OT.initPublisher(err => {
        expect(err).toBeFalsy();
        publisher.on('destroyed', () => {
          // Check that filterTask isn't still being called after we destroyed the publisher
          const callCount = window.requestAnimationFrame.calls.count();
          expect(callCount).toBeGreaterThan(0);
          setTimeout(() => {
            expect(window.requestAnimationFrame.calls.count()).toBe(callCount);
            done();
          }, 100);
        });
        publisher.destroy();
      });
      filter.setPublisher(publisher);
    });

    it('successfully publishes', done => {
      const publisher = OT.initPublisher(err => {
        expect(err).toBeFalsy();
        publisher.on('destroyed', done);
        publisher.destroy();
      });
      filter.setPublisher(publisher);
    });

    it('lets you change the filter', done => {
      const publisher = OT.initPublisher(err => {
        expect(err).toBeFalsy();
        filter.change(filters.invert);
        filter.change(filters.grayscale);
        publisher.on('destroyed', done);
        publisher.destroy();
      });
      filter.setPublisher(publisher);
    });

    it('can be published to a session', done => {
      const session = OT.initSession(API_KEY, SESSION_ID);
      session.connect(TOKEN, err => {
        expect(err).toBeFalsy();
        const publisher = session.publish(pubErr => {
          expect(pubErr).toBeFalsy();
          session.disconnect();
          done();
        });
        filter.setPublisher(publisher);
      });
    });
  });
});
