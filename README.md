[![Build Status](https://travis-ci.org/aullman/opentok-camera-filters.svg?branch=master)](https://travis-ci.org/aullman/opentok-camera-filters)

# opentok-camera-filters
Library which lets you add visual filters to your OpenTok Publisher.

![opentok-camera-filters collage](https://github.com/aullman/opentok-camera-filters/raw/master/images/Collage.png)

# [Demo](https://aullman.github.io/opentok-camera-filters/)

# [Blog Post](http://www.tokbox.com/blog/camera-filters-in-opentok-for-web/)

# Browser Support

* Chrome 51+
* Firefox 49+
* Safari 11+

These filters require the Canvas [captureStream API](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream) which works in Chrome 51+, Firefox 43+ and Safari 11+ (and Safari on iOS 11). Adding audio to the stream only started working in Firefox 49+.

# Usage

You can view the [source code for the demo](https://github.com/aullman/opentok-camera-filters/blob/gh-pages/src/demo.js) for an example of how to use this library.

```javascript
const filters = require('opentok-camera-filters/src/filters.js');
const filterFn = require('opentok-camera-filters');
```

Then you get your media strea you want to filter and pass it to the filter function eg.

```javascript
const publish = OT.getUserMedia().then((mediaStream) => {
  // Initialise with filter none
  filter = filterFn(mediaStream, filters.none);

  const publisherOptions = {
    // Pass in the canvas stream video track as our custom videoSource
    videoSource: filter.canvas.captureStream(30).getVideoTracks()[0],
    // Pass in the audio track from our underlying mediaStream as the audioSource
    audioSource: mediaStream.getAudioTracks()[0],
  };

  const publisher = OT.initPublisher('publisher', publisherOptions, handleError);
  filter.setPublisher(publisher);

  return publisher;
});
```

Then when we have successfully connected we publish the publisher to the Session.

```javascript
session.connect(TOKEN, err => {
  if (err) handleError(err);
  publish.then(publisher => {
    session.publish(publisher, handleError);
  });
});
```

If you want to change the filter you can use the change method, eg.

```javascript
filter.change(filters.red);
```

# Available Filters

A lot of the filters were taken from [tracking.js](https://trackingjs.com).

## red
Give the video a red tint

![red](https://github.com/aullman/opentok-camera-filters/raw/master/images/red.png)

## green
Give the video a green tint

![green](https://github.com/aullman/opentok-camera-filters/raw/master/images/green.png)

## blue
Give the video a blue tint

![blue](https://github.com/aullman/opentok-camera-filters/raw/master/images/blue.png)


## invert
Inverts the colour in every pixel of the video.

![invert](https://github.com/aullman/opentok-camera-filters/raw/master/images/invert.png)

## grayscale
Converts a colour from a colorspace based on an RGB color model to a grayscale representation of its luminance.

![grayscale](https://github.com/aullman/opentok-camera-filters/raw/master/images/grayscale.png)

## sepia

Applies a sepia tone to the image.
![sepia](https://github.com/aullman/opentok-camera-filters/raw/master/images/sepia.png)

## blur
A Gaussian blur (also known as Gaussian smoothing) is the result of blurring an image by a Gaussian function.

![blur](https://github.com/aullman/opentok-camera-filters/raw/master/images/blur.png)

## sketch
Computes the vertical and horizontal gradients of the image and combines the computed images to find edges in the image.

![sketch](https://github.com/aullman/opentok-camera-filters/raw/master/images/sketch.png)

## face
Does face detection using [clmtrackr](https://github.com/auduno/clmtrackr) and draws an image on top of the face.

![face](https://github.com/aullman/opentok-camera-filters/raw/master/images/face.png)

# Custom Filters

If you want to create your own custom filter you just need to create a function that looks like one of the functions in the [filters.js](src/filters.js) file. These functions accept a videoElement and a canvas parameter and they take the data out of the videoElement which is rendering the unfiltered video from the camera and they draw it onto the canvas after applying a filter. It should return an object with a stop method which when called will stop the filter from processing. For example creating a simple filter which draws a new random colour every second would look something like:

```javascript
const randomColour = () => {
  return Math.round(Math.random() * 255);
};

filter.change((videoElement, canvas) => {
  const interval = setInterval(() => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = `rgb(${randomColour()}, ${randomColour()}, ${randomColour()})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, 1000);
  return {
    stop: () => {
      clearInterval(interval);
    }
  };
});
```

You can also use the [filterTask](src/filterTask.js) which handles transforming image data from the videoElement and just lets you pass it a filter function which takes ImageData and transforms it returning new ImageData. The [invert function](https://github.com/aullman/opentok-camera-filters/blob/a845d2f4eec8a8a6bea86c3a785ef089656d861f/src/filters.js#L92) is a good example of a simple filter which uses this.

If you want access to the face tracking data from [clmtrackr](https://github.com/auduno/clmtrackr) you can use the `face()` filter and pass in your own renderer function like so:

```javascript
filter.change((videoElement, canvas) => {
  return filters.face(videoElement, canvas, positions => {
    // Do something with the positions and draw something on the canvas
  });
});
```

The positions are the response from `clmtrackr.getCurrentPosition()`. The [glasses filter](https://github.com/aullman/opentok-camera-filters/blob/master/src/filters.js#L115) is an example of a face filter.
