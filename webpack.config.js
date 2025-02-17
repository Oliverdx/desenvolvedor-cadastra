const path = require("path");
const webpack = require("webpack");

module.exports = (paths) => ({
  entry: {
    main: path.resolve(__dirname, paths.scripts.src),
  },
  output: {
    path: path.resolve(__dirname, paths.dest),
    filename: "bundle.js",
  },
  mode: "development",
  resolve: {
    extensions: ['', '.js', '.jsx', '.ts']
  },  
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /(node_modules|bower_components)/,
        use: "ts-loader",
      },
    ],
  },
  plugins: [],
});
