/** @type {import('next').NextConfig} */
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports =  {
  reactStrictMode: true,



 webpack(config, options) {
   const { dev, isServer } = options;

   // Do not run type checking twice:
   if (dev && isServer) {
     config.plugins.push(new ForkTsCheckerWebpackPlugin());
   }

   return config;
}
};



