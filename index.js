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

const fetchProps = {
  headers: {
    "Content-Type": "application/json",
  },
}

function makeEndpoint (methodName, path, queryParams = []) {
  return async function (parameters, { fetch } = {}) {
    if (typeof parameters.key !== "string") {
      throw new Error("Must pass an API key")
    }

    const u = new global.URL(baseURL)
    u.pathname = interpolate(path, parameters)
    u.searchParams.set("token", parameters.key)
    for (const key of queryParams) {
      if (parameters[key] == null) continue
      u.searchParams.set(key, parameters[key])
    }

    console.log("REQUESTING:", u.toString())
    if (fetch == null) fetch = global.fetch

    const resp = await fetch(u.toString(), fetchProps)
    if (resp.status !== 200) {
      const text = await resp.text()
      const err = new Error("ACTransit API error")
      err.rawResponse = text
      throw err
    }

    return resp.json()
  };
}

const endpoints = [
  {
    methodName: "nearbyStops",
    path: "transit/stops/{latitude}/{longitude}/{distance}",
    queryParams: [ "routeName" ],
  },
  {
    methodName: "stopPredictions",
    path: "transit/stops/{stopId}/predictions",
  },
]

endpoints.forEach(({ methodName, path, queryParams }) => {
  ACTransit[methodName] = makeEndpoint(methodName, path, queryParams)
  ACTransit.prototype[methodName] = function (_params) {
    const params = Object.assign({}, _params, { key: this._key })
    return ACTransit[methodName](params, { fetch: this._fetch })
  }
})

function interpolate (base, props) {
  return Object.keys(props).reduce(function (str, key) {
    return str.replace(new RegExp(`{${key}}`, "g"), props[key])
  }, base)
}