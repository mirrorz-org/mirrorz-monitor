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

## grafana

Grafana uses influxdb as data source. You may import `grafana.json` as a new dashboard.

Note: queries are saved in the json, if you do not find them after importing, manually import them.
