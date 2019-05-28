const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const path = require('path');

module.exports = {
  entry: {
    bundle: './src/frontend/app.js',
    sheets: './src/frontend/sheets.js'
  },
  output: {
    filename: '[name].[hash].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.(scss)$/,
        use:  ExtractTextWebpackPlugin.extract({
          fallback: 'style-loader',
          use:  [
                  {
                    // Interprets `@import` and `url()` like `import/require()` and will resolve them
                    loader: 'css-loader'
                  },
                  {
                    // Loader for webpack to process CSS with PostCSS
                    loader: 'postcss-loader',
                    options: {
                      plugins: function () {
                        return [
                          require('autoprefixer')
                        ];
                      }
                    }
                  },
                  {
                    // Loads a SASS/SCSS file and compiles it to CSS
                    loader: 'sass-loader'
                  }
                ]
      })
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {},
          },
        ],
      },
      {
        test: /\.(html)$/,
        include: [
          path.resolve(__dirname, 'src', 'frontend', 'views')
        ],
        use: {
          loader: 'html-loader',
          options: {
            attrs: ['link:href', 'img:src']
          },
        }
      },
    ]
  },
  plugins: [
        new webpack.ProvidePlugin({
           $: "jquery",
           jQuery: "jquery"
        }),
        new CleanWebpackPlugin({
          verbose: true,
                    cleanOnceBeforeBuildPatterns: [],
                    cleanAfterEveryBuildPatterns: [
                        '*.js',
                        '*.css',
                        '*.html',
                        '*.png',
                        '!sheets/*',
                        '!songs/*'
                    ]
        }),
        new ExtractTextWebpackPlugin("[name].[hash].css"),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/frontend/index.ejs',
            chunks: ['bundle']
        }),
        new HtmlWebpackPlugin({
            filename: 'sheets.html',
            template: './src/frontend/sheets.ejs',
            chunks: ['sheets']
        }),
    ],
};
