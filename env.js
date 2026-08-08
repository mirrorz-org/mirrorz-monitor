/** InfluxDB v2 URL */
const url = process.env['INFLUX_URL'] || 'http://localhost:8086'
/** InfluxDB authorization token */
const token = process.env['INFLUX_TOKEN'] || 'TOKEN=='
/** Organization within InfluxDB  */
const org = process.env['INFLUX_ORG'] || 'mirrorz'
/**InfluxDB bucket used in examples  */
const bucket = 'mirrorz'

/** Optional InfluxDB v1 endpoint for dual writes. Disabled when unset. */
const v1Url = process.env['INFLUX_V1_URL']
const v1Database = process.env['INFLUX_V1_DATABASE'] || 'mirrorz'
const v1Username = process.env['INFLUX_V1_USERNAME'] || ''
const v1Password = process.env['INFLUX_V1_PASSWORD'] || ''

module.exports = {
  url,
  token,
  org,
  bucket,
  v1Url,
  v1Database,
  v1Username,
  v1Password,
}
