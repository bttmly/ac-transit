const endpoints = require("./endpoints")

function ACTransit (opts) {
  if (!(this instanceof ACTransit)) return new ACTransit(opts)
  if (typeof opts === "string") {
    this._key = opts
  } else {
    this._key = opts.key
    this._fetch = opts.fetch
    this._URL = opts.URL
  }
}
module.exports = ACTransit

const baseURL = "http://api.actransit.org/"

const fetchPropsJSON = {
  headers: {
    "Content-Type": "application/json",
  },
}

const fetchPropsText = {}

function makeEndpoint (methodName, path, queryParams = [], type = "json") {
  return function (parameters = {}, { fetch = global.fetch, URL = global.URL } = {}) {
    if (typeof parameters.key !== "string") return Promise.reject(new Error("Must pass an API key"))
    if (fetch == null) return Promise.reject(new Error("Must have a global `fetch` function or pass an implementation"))
    if (URL == null) return Promise.reject(new Error("Must have a global `URL` constructor or pass an implementation"))

    const fetchProps = type === "json" ? fetchPropsJSON : fetchPropsText

    const u = new URL(baseURL)
    u.pathname = interpolate(path, parameters)
    u.searchParams.set("token", parameters.key)
    for (const key of queryParams) {
      if (parameters[key] == null) continue
      u.searchParams.set(key, parameters[key])
    }

    return fetch(u.toString(), fetchProps)
      .then(function (resp) {
        if (resp.status !== 200) {
          return resp.text(function (text) {
            throw new Error(text)
          })
        }

        return type === "json" ? resp.json() : resp.text()
      })
  }
}

endpoints.forEach(({ methodName, path, queryParams, type }) => {
  ACTransit[methodName] = makeEndpoint(methodName, path, queryParams, type)
  ACTransit.prototype[methodName] = function (_params = {}) {
    const params = Object.assign({}, _params, { key: this._key })
    return ACTransit[methodName](params, { fetch: this._fetch, URL: this._URL })
  }
})

function interpolate (base, props) {
  return Object.keys(props).reduce(function (str, key) {
    return str.replace(new RegExp(`{${key}}`, "g"), props[key])
  }, base)
}
