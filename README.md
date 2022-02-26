# Monitor

Code of MirrorZ monitor.

Use [https://mirrorz.org/monitor](https://mirrorz.org/monitor) to view one instance of such monitor.

## main.js

Use `node main.js` to insert data into one influxdb 2.x

You may configure those secrets in `env.js`

`parser` directory is from `mirrorz-org/mirrorz-parser`.

```
git clone git@github.com:mirrorz-org/mirrorz-parser.git parser
```

## influxdb

Use influxdb 2.x. Make sure you have a bucket named `mirrorz`.

```bash
# influx setup
> Welcome to InfluxDB 2.0!
? Please type your primary username mirrorz
? Please type your password
? Please type your password again
? Please type your primary organization name mirrorz
? Please type your primary bucket name mirrorz
? Please type your retention period in hours, or 0 for infinite 0
? Setup with these parameters?
  Username:          mirrorz
  Organization:      mirrorz
  Bucket:            mirrorz
  Retention Period:  infinite
 Yes
User    Organization    Bucket
mirrorz mirrorz         mirrorz
# influx bucket list
ID Name
deadbeaf mirrorz
# influx auth create -u mirrorz -o mirrorz --write-bucket deadbeaf
# influx auth create -u mirrorz -o mirrorz --read-bucket deadbeaf
```

## grafana

Grafana uses influxdb as data source. You may import `grafana.json` as a new dashboard.

Note: queries are saved in the json, if you do not find them after importing, manually import them.
