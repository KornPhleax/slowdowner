const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.production.js');

module.exports = merge(baseConfig, {
  devtool: 'inline-source-map'
});
