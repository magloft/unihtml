const { babel } = require('@rollup/plugin-babel')

module.exports = {
  input: './build/index.js',
  output: { name: 'main', file: 'build/index.js', format: 'umd' },
  plugins: [babel({ babelHelpers: 'bundled', exclude: 'node_modules/**' })]
}