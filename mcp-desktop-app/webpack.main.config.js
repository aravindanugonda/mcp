const path = require('path');

module.exports = {
  mode: 'development',
  target: 'electron-main',
  entry: './src/main/main.ts',
  output: {
    path: path.resolve(__dirname, 'dist/main'),
    filename: 'main.js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.(ts)$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
    ],
  },
  node: {
    __dirname: false,
    __filename: false,
  },
};
