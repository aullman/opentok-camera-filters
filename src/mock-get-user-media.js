
// Takes a mockOnStreamAvailable function which when given a webrtcstream returns a new stream
// to replace it with.
module.exports = function mockGetUserMedia(mockOnStreamAvailable) {
  const oldGetUserMedia = navigator.webkitGetUserMedia;
  navigator.webkitGetUserMedia = function getUserMedia(constraints, onStreamAvailable,
      onStreamAvailableError, onAccessDialogOpened, onAccessDialogClosed, onAccessDenied) {
    return oldGetUserMedia.call(navigator, constraints, stream => {
      onStreamAvailable(mockOnStreamAvailable(stream));
    }, onStreamAvailableError,
      onAccessDialogOpened, onAccessDialogClosed, onAccessDenied);
  };
};
