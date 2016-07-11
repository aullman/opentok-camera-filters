module.exports = {
  entry: {
    demo: './src/demo.js',
    faceWorker: './src/faceWorker.js',
  },
  output: {
    path: './js/',
    filename: '[name].bundle.js',
  },
  devtool: 'source-map',
};
