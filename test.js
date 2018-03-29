require("dotenv").config()
const url = require("url");
const { fetch } = require("fetch-ponyfill")();

const ACTransit = require("./");
const client = new ACTransit({ key: process.env.AC_TRANSIT_API_TOKEN, fetch, URL: url.URL })

const test = require("ava");

// Downtown Oakland
const latitude = "37.804363";
const longitude = "-122.271111";
const distance = 2500;
const stopId = 54700;

global.URL = url.URL;

test("nearbyStops", async t => {
  await client.nearbyStops({ latitude, longitude })
  t.pass()
})

test("stopPredictions", async t => {
  await client.stopPredictions({ stopId })
  t.pass()
})