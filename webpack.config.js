module.exports = {
  entry: {
    filters: './src/filters.js',
    filter: './src/filter.js',
  },
  output: {
    path: './dist/',
    filename: '[name].js',
    library: 'ot[name]',
    libraryTarget: 'umd',
  },
  devtool: 'source-map',
};
