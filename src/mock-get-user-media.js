// Takes a mockOnStreamAvailable function which when given a webrtcstream returns a new stream
// to replace it with.
let mockedGetUserMedia;
module.exports = function mockGetUserMedia(mockOnStreamAvailable) {
  let didMock = false;

  ['getUserMedia', 'webkitGetUserMedia', 'mozGetUserMedia'].forEach(gumKey => {
    if (navigator[gumKey]) {
      didMock = true;
      const oldGetUserMedia = navigator[gumKey].bind(navigator);
      navigator[gumKey] = (constraints, onStreamAvailable, ...args) => (
        oldGetUserMedia(constraints, stream => (
          onStreamAvailable(mockOnStreamAvailable(stream))
        ), ...args)
      );
    }
  });

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    didMock = true;
    const oldGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    mockedGetUserMedia = constraints => (
      oldGetUserMedia(constraints).then(mockOnStreamAvailable)
    );
    navigator.mediaDevices.getUserMedia = mockedGetUserMedia;
  }

  if (!didMock) {
    console.warn('Could not find getUserMedia function to mock out');
  }
};
