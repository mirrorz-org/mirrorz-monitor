const { InfluxDB } = require("@influxdata/influxdb-client");
const { url, token, org } = require("../env");

function createQueryApi() {
  return new InfluxDB({url, token}).getQueryApi(org);
}

module.exports = { createQueryApi };
