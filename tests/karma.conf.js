module.exports = config => {
  config.set({
    frameworks: ['jasmine'],

    files: ['*.js'],

    preprocessors: {
      '*.js': ['webpack'],
    },

    browsers: ['Chrome_fakeDevices'],

    plugins: [
      'karma-chrome-launcher',
      'karma-webpack',
      'karma-jasmine',
    ],

    webpack: {
      devtool: 'inline-source-map',
    },

    customLaunchers: {
      Chrome_fakeDevices: {
        base: 'Chrome',
        flags: ['--use-fake-device-for-media-stream',
                '--use-fake-ui-for-media-stream', '--disable-popup-blocking'],
      },
    },

    webpackMiddleware: {
      noInfo: true,
    },
  });
};
