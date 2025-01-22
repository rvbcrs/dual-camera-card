const path = require("path");

module.exports = {
  entry: "./src/dual-camera-card.js",
  output: {
    filename: "dual-camera-card.js",
    path: path.resolve(__dirname, "dist"),
  },
  mode: "production",
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
      },
    ],
  },
};
