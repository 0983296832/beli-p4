const { merge } = require('webpack-merge');
const commonConfig = require('./webpack.common.js');

/** @type {(env: any, arg: {mode: string}) => import('webpack').Configuration} **/
module.exports = (envVars) => {
  const { env } = envVars;
  const envConfig = require(`./webpack.${env}.js`);
  const config = merge(commonConfig, envConfig);
  return config;
};
