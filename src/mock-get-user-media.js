// Takes a mockOnStreamAvailable function which when given a webrtcstream returns a new stream
// to replace it with.
module.exports = function mockGetUserMedia(mockOnStreamAvailable) {
  let oldGetUserMedia;
  if (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia) {
    oldGetUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;
    navigator.webkitGetUserMedia = navigator.getUserMedia = navigator.mozGetUserMedia =
      function getUserMedia(constraints, onStreamAvailable, onStreamAvailableError,
                            onAccessDialogOpened, onAccessDialogClosed, onAccessDenied) {
        return oldGetUserMedia.call(navigator, constraints, stream => {
          onStreamAvailable(mockOnStreamAvailable(stream));
        }, onStreamAvailableError,
        onAccessDialogOpened, onAccessDialogClosed, onAccessDenied);
      };
  }
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    oldGetUserMedia = navigator.mediaDevices.getUserMedia;
    navigator.mediaDevices.getUserMedia = function getUserMedia(constraints) {
      return new Promise((resolve, reject) => {
        oldGetUserMedia.call(navigator.mediaDevices, constraints).then(stream => {
          resolve(mockOnStreamAvailable(stream));
        }).catch(reject);
      });
    };
  } else {
    console.warn('Could not find getUserMedia function to mock out');
  }
};
