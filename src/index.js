const endpoints = require("./endpoints");

function ACTransit (opts) {
  if (!(this instanceof ACTransit)) return new ACTransit(opts)
  if (typeof opts === "string") {
    this._key = opts
  } else {
    this._key = opts.key
    this._fetch = opts.fetch
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

function makeEndpoint (methodName, path, queryParams = [], type) {
  return async function (parameters = {}, { fetch } = {}) {
    if (typeof parameters.key !== "string") {
      throw new Error("Must pass an API key")
    }


    const fetchProps = type === "json" ? fetchPropsJSON : fetchPropsText

    const u = new global.URL(baseURL)
    u.pathname = interpolate(path, parameters)
    u.searchParams.set("token", parameters.key)
    for (const key of queryParams) {
      if (parameters[key] == null) continue
      u.searchParams.set(key, parameters[key])
    }

    // console.log("REQUESTING:", u.toString())
    if (fetch == null) fetch = global.fetch

    const resp = await fetch(u.toString(), fetchProps)
    if (resp.status !== 200) {
      const text = await resp.text()
      const err = new Error("ACTransit API error")
      err.rawResponse = text
      throw err
    }

    return type === "json" ? resp.json() : resp.text()
  }
}

endpoints.forEach(({ methodName, path, queryParams, type = "json" }) => {
  ACTransit[methodName] = makeEndpoint(methodName, path, queryParams, type)
  ACTransit.prototype[methodName] = function (_params = {}) {
    const params = Object.assign({}, _params, { key: this._key })
    return ACTransit[methodName](params, { fetch: this._fetch })
  }
})

function interpolate (base, props) {
  return Object.keys(props).reduce(function (str, key) {
    return str.replace(new RegExp(`{${key}}`, "g"), props[key])
  }, base)
}