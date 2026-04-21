const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const fs = require('fs');
const path = require('path');

class VersionPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('VersionPlugin', () => {
      const version = Date.now().toString();
      const filePath = path.resolve(compiler.options.output.path, 'version.json');
      fs.writeFileSync(filePath, JSON.stringify({ version }, null, 2));
      console.log('✅ version.json generated:', version);
    });
  }
}

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.name': JSON.stringify('Lê Văn Bình')
    }),
    // Đưa css ra thành một file .css riêng biệt thay vì bỏ vào file .js
    new MiniCssExtractPlugin({
      filename: 'build/css/[name].[contenthash:6].css'
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'disabled' // Vô hiệu hóa server phân tích
    }),
    new webpack.ProgressPlugin(),
    new CleanWebpackPlugin(),
    new VersionPlugin()
  ],
  optimization: {
    minimizer: [
      `...`, // Cú pháp kế thừa bộ minimizers mặc định trong webpack 5 (i.e. `terser-webpack-plugin`)
      new CssMinimizerPlugin() // minify css
    ]
  }
};
