/* global describe it expect OT beforeEach afterEach SESSION_ID TOKEN API_KEY jasmine spyOn */
const filters = require('../src/filters.js');
const filterFn = require('../src/filter.js');
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

describe('filter', () => {
  let filter;
  let mediaStream;
  beforeEach((done) => {
    OT.getUserMedia().then(stream => {
      mediaStream = stream;
      filter = filterFn(mediaStream, filters.none);
    }).then(done, done.fail);
  });

  afterEach(() => {
    filter.destroy();
  });

  it('defines setPublisher and change methods', () => {
    expect(filter.setPublisher).toBeDefined();
    expect(filter.change).toBeDefined();
  });

  it('stops drawing frames and stops the stream when it is destroyed', done => {
    spyOn(window, 'requestAnimationFrame').and.callThrough();
    let callCount;
    setTimeout(() => {
      callCount = window.requestAnimationFrame.calls.count();
      expect(callCount).toBeGreaterThan(0);
      filter.destroy();
    }, 500);
    setTimeout(() => {
      expect(window.requestAnimationFrame.calls.count()).toBe(callCount);
      // Check that the original stream was stopped
      mediaStream.getTracks().forEach(track => {
        expect(track.readyState).toEqual('ended');
      });
      done();
    }, 1000);
  });

  describe('OpenTok Publisher', () => {
    it('destroy is called when the publisher is destroyed', done => {
      spyOn(filter, 'destroy').and.callThrough();
      const publisher = OT.initPublisher({
        videoSource: filter.canvas.captureStream(30).getVideoTracks()[0],
        audioSource: mediaStream.getAudioTracks()[0],
      }, err => {
        expect(err).toBeFalsy();
        publisher.on('destroyed', () => {
          expect(filter.destroy).toHaveBeenCalled();
          done();
        });
        publisher.destroy();
      });
      filter.setPublisher(publisher);
    });

    it('successfully publishes', done => {
      const publisher = OT.initPublisher({
        videoSource: filter.canvas.captureStream(30).getVideoTracks()[0],
        audioSource: mediaStream.getAudioTracks()[0],
      }, err => {
        expect(err).toBeFalsy();
        publisher.on('destroyed', done);
        publisher.destroy();
      });
      filter.setPublisher(publisher);
    });

    it('lets you change the filter', done => {
      const publisher = OT.initPublisher({
        videoSource: filter.canvas.captureStream(30).getVideoTracks()[0],
        audioSource: mediaStream.getAudioTracks()[0],
      }, err => {
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
        const publisher = session.publish(null, {
          videoSource: filter.canvas.captureStream(30).getVideoTracks()[0],
          audioSource: mediaStream.getAudioTracks()[0],
        }, pubErr => {
          expect(pubErr).toBeFalsy();
          session.disconnect();
          done();
        });
        filter.setPublisher(publisher);
      });
    });
  });
});
