require("dotenv").config()
const { URL } = require("url")
const expect = require("expect")
const { fetch } = require("fetch-ponyfill")()

const key = process.env.AC_TRANSIT_API_TOKEN
const ACTransit = require("../")
const client = new ACTransit({ key, fetch, URL })

const latitude = "37.804363"
const longitude = "-122.271111"
const stopId = 54700
const routeName = "NL"

let vehicleId, tripId, fromStopId, toStopId

it("ACTransit::routes", async () => {
  await client.routes()
})

it("ACTransit::route", async () => {
  await client.route({ routeName })
})

it("ACTransit::routeVehicles", async () => {
  const results = await client.routeVehicles({ routeName })
  vehicleId = results[0].VehicleId
  tripId = results[0].CurrentTripId
})

it("ACTransit::routeDirections", async () => {
  await client.routeDirections({ routeName })
})

it("ACTransit::routeTrip", async () => {
  await client.routeTrip({ routeName, tripId })
})

it("ACTransit::routeTripStops", async () => {
  const results = await client.routeTripStops({ routeName, tripId })
  const [ secondLastStop, lastStop ] = results.slice(-2)
  fromStopId = secondLastStop.StopId
  toStopId = lastStop.StopId
})

it("ACTransit::routeVehicles", async () => {
  await client.routeVehicles({ routeName })
})

it("ACTransit::routeTripEstimate", async () => {
  await client.routeTripEstimate({ routeName, fromStopId, toStopId })
})

it("ACTransit::nearbyStops", async () => {
  await client.nearbyStops({ latitude, longitude })
})

it("ACTransit::stopPredictions", async () => {
  await client.stopPredictions({ stopId })
})

it("ACTransit::vehicle", async () => {
  await client.vehicle({ vehicleId })
})

it("ACTransit::serviceNotices", async () => {
  await client.serviceNotices()
})

it("ACTransit::serviceNotices", async () => {
  await client.serviceNotices()
})

it("ACTransit::gtfsRealTimeTripUpdates", async () => {
  await client.gtfsRealTimeTripUpdates()
})

it("ACTransit::gtfsRealTimeAlerts", async () => {
  await client.gtfsRealTimeAlerts()
})

it("ACTransit::gtfsRealTimeVehicles", async () => {
  await client.gtfsRealTimeVehicles()
})

it("ACTransit::gtfsInfo", async () => {
  await client.gtfsInfo()
})

it("ACTransit::gtfsSchedule", async () => {
  await client.gtfsSchedule()
}).timeout(30000)

describe.only("dependencies", () => {
  it("needs an API key", async () => {
    expect.assertions(1)
    try {
      await ACTransit.routes()
    } catch (e) {
      expect(e.message).toMatch("Must pass an API key")
    }
  })

  it("needs a fetch implementation", async () => {
    expect.assertions(1)
    try {
      await ACTransit.routes({ key }, { URL })
    } catch (e) {
      expect(e.message).toMatch("Must have a global `fetch` function or pass an implementation")
    }
  })

  it("needs a URL implementation", async () => {
    expect.assertions(1)
    try {
      await ACTransit.routes({ key }, { fetch })
    } catch (e) {
      expect(e.message).toMatch("Must have a global `URL` constructor or pass an implementation")
    }
  })
})
