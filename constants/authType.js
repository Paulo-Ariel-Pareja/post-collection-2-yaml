const basicAuth = {
  type: 'http',
  scheme: 'basic'
}

const apiKeyAuth = {
  type: 'apiKey',
  in: 'header', // can be "header", "query" or "cookie" but we always put "header"... maybe later fix it
  name: 'X-API-KEY'
}

const bearer = {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT'
}

module.exports = {
  basicAuth,
  apiKeyAuth,
  bearer
}
