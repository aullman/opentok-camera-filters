const OpenTok = require('opentok');
const opentok = new OpenTok(process.env.OT_API_KEY, process.env.OT_API_SECRET);
const webpack = require('webpack');

const globalVars = {
  API_KEY: JSON.stringify(process.env.OT_API_KEY),
  SESSION_ID: JSON.stringify(process.env.OT_SESSION_ID),
  TOKEN: JSON.stringify(opentok.generateToken(process.env.OT_SESSION_ID)),
};

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
      'karma-firefox-launcher',
      'karma-webpack',
      'karma-jasmine',
    ],

    webpack: {
      devtool: 'inline-source-map',
      plugins: [
        new webpack.DefinePlugin(globalVars),
      ],
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
