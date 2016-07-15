module.exports = config => {
  config.set({
    frameworks: ['jasmine'],

    files: ['*.js'],

    preprocessors: {
      '*.js': ['webpack'],
    },

    browsers: [process.env.BROWSER || 'chrome'],

    plugins: [
      'karma-chrome-launcher',
      'karma-webpack',
      'karma-jasmine',
    ],

    webpack: {
      devtool: 'inline-source-map',
    },

    customLaunchers: {
      chrome: {
        base: 'Chrome',
        flags: ['--use-fake-device-for-media-stream',
                '--use-fake-ui-for-media-stream', '--disable-popup-blocking'],
      },
      firefox: {
        base: 'Firefox',
        prefs: {
          'media.navigator.permission.disabled': true,
          'media.navigator.streams.fake': true,
        },
      },
    },

    webpackMiddleware: {
      noInfo: true,
    },
  });
};
