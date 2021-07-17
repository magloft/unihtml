const root = __dirname.replace(/\\/g, "/")

module.exports = {
  optimize: { minify: true, target: 'es2018' },
  plugins: [['@snowpack/plugin-typescript']],
  exclude: [
    '**/node_modules/**/*',
    `${root}/tsconfig.json`,
    `${root}/rollup.config.js`,
    `${root}/index.html`
  ]
}
