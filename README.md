# Monitor

Code of MirrorZ monitor.

Use [https://mirrorz.org/monitor](https://mirrorz.org/monitor) to view one instance of such monitor.

## main.js

Use `node main.js` to insert data into an InfluxDB 1.x server, or an InfluxDB 2.x
server with its v1 compatibility API enabled.

You should configure those secrets in `env.js`

Set `MIRRORZ_LOCAL_FETCH_FILE` to a local directory path to make `fetch()` read local files for URLs under `config.url` (Node runtime only). For example, if `config.url` is `https://example.com/`, then `https://example.com/a/b/c` maps to `$MIRRORZ_LOCAL_FETCH_FILE/a/b/c`. If the variable is unset, default network behavior is used.

`config` directory is from `mirrorz-org/mirrorz-config`.


```bash
git clone git@github.com:mirrorz-org/mirrorz-config.git config
pushd config && npm i && ln -sf config/localhost.1234.json config.json && popd
```

## influxdb

The monitor writes line protocol to the InfluxDB v1-compatible `/write` endpoint.
Configure one target with the following environment variables:

```bash
export INFLUX_URL=http://localhost:8086
export INFLUX_DATABASE=mirrorz
```

For InfluxDB 1.x username/password authentication, also set:

```bash
export INFLUX_USERNAME=mirrorz-monitor
export INFLUX_PASSWORD=secret
```

For InfluxDB 2.x, set `INFLUX_TOKEN` instead. `INFLUX_DATABASE` must have a DBRP
mapping to the target bucket. The target database or bucket must already exist,
and the configured credentials need write permission.

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
