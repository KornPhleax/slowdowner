module.exports = (env) => {
  if(env.production)
    return require(`./webpack.config.production.js`)
  return require(`./webpack.config.development.js`)
}