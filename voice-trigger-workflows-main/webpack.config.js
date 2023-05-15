const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'voice-trigger-workflows.js',
  },
  ignoreWarnings:[
    { message: /entrypoint size limit/ },
    { message: /webpack performance recommendations/},
    { message: /asset size limit/}
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 8081,
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ['lit-scss-loader', 'extract-loader', 'css-loader', 'sass-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      minify: false
    })
  ]
};