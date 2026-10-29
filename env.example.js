/** InfluxDB URL (v1 or a v2 server with the v1 compatibility API enabled) */
const url = process.env['INFLUX_URL'] || 'http://localhost:8086'
/** InfluxDB v2 authorization token */
const token = process.env['INFLUX_TOKEN'] || ''
/** Database name (or DBRP-mapped database on InfluxDB v2) */
const database = process.env['INFLUX_DATABASE'] || 'mirrorz'
/** InfluxDB v1 username and password */
const username = process.env['INFLUX_USERNAME'] || ''
const password = process.env['INFLUX_PASSWORD'] || ''

module.exports = {
  url,
  token,
  database,
  username,
  password,
}
