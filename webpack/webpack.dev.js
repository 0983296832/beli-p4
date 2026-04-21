const webpack = require('webpack');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  devServer: {
    hot: true,
    open: false,
    liveReload: true,
    historyApiFallback: true,
    allowedHosts: 'all'
  },
  plugins: [
    new ReactRefreshWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env.name': JSON.stringify('Lê Văn Bình')
    }),
    // Đưa css ra thành một file .css riêng biệt thay vì bỏ vào file .js
    new MiniCssExtractPlugin({
      filename: '[name].css'
    })
  ]
};
