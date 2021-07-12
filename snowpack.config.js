/** @type {import("snowpack").SnowpackUserConfig } */
module.exposts = {
  optimize: {
    minify: true,
    target: 'es2018',
  },
  plugins: [
    ['@snowpack/plugin-typescript'],
    ["@snowpack/plugin-webpack"]
  ]
}
