const webpack = require('webpack');
const OpenTok = require('opentok');
const opentok = new OpenTok(process.env.OT_API_KEY, process.env.OT_API_SECRET);

module.exports = {
  entry: {
    index: './src/index.js',
  },
  output: {
    path: './js/',
    filename: '[name].bundle.js',
  },
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      config: {
        OT_API_KEY: JSON.stringify(process.env.OT_API_KEY),
        OT_SESSION_ID: JSON.stringify(process.env.OT_SESSION_ID),
        OT_TOKEN: JSON.stringify(opentok.generateToken(process.env.OT_SESSION_ID, {
          expireTime: (new Date().getTime() / 1000) + (10 * 24 * 60 * 60), // in 10 days
        })),
      },
    }),
  ],
};
