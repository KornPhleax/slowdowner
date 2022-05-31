const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');

module.exports = {
  entry: {
    bundle: './src/frontend/app.js',
    sheets: './src/frontend/sheets.js'
  },
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.module\.s(a|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true
            },
          },
          {
            loader: 'sass-loader',
            options: {}
          }
        ]
      },
      {
        test: /\.s(a|c)ss$/,
        exclude: /\.module.(s(a|c)ss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            options: {}
          }
        ]
      },
      {
        test: /\.(png|jpg|gif)$/,
        type: 'asset/inline',
      },
      {
        test: /\.(html)$/,
        include: [
          path.resolve(__dirname, 'src', 'frontend', 'views')
        ],
        use: {
          loader: 'html-loader',
          options: {}
        }
      }
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
        new MiniCssExtractPlugin({
          filename: '[name].[contenthash].css',
          chunkFilename: '[id].[contenthash].css'
        }),
        new HtmlWebpackPlugin({
            inject: true,
            filename: 'index.html',
            template: './src/frontend/index.ejs',
            chunks: ['bundle']
        }),
        new HtmlWebpackPlugin({
            inject: true,
            filename: 'sheets.html',
            template: './src/frontend/sheets.ejs',
            chunks: ['sheets']
        }),
    ],
};
