const config = require("./config/config.json");

const { init, load } = require("./config/parser/node");
init(config, "mirrorz-monitor"); // global.fetch, global.DOMParser, global.Timeout, global.timeout
const parsers = require("./config/parser/parsers");

const LIST = config.monitor_mirrors
  .concat(config.monitor_parser.map((e) => parsers[e]));

const { REPO, lload } = require("./lastupdate/_node");

const {InfluxDB, Point, HttpError} = require('@influxdata/influxdb-client')
const {
  url, token, org, bucket,
  v1Url, v1Database, v1Username, v1Password,
} = require('./env')

const writeApi = new InfluxDB({url, token}).getWriteApi(org, bucket, 'ns')
const cur = new Date();

async function writeInfluxDBV1(points) {
  if (!v1Url)
    return;

  const endpoint = new URL('/write', v1Url);
  endpoint.searchParams.set('db', v1Database);
  endpoint.searchParams.set('precision', 'ns');

  const headers = {'Content-Type': 'text/plain; charset=utf-8'};
  if (v1Username || v1Password) {
    headers.Authorization = 'Basic ' + Buffer
      .from(`${v1Username}:${v1Password}`)
      .toString('base64');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: points.map((point) => point.toLineProtocol()).join('\n'),
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`InfluxDB v1 write failed: HTTP ${response.status}: ${message}`);
  }
}

async function write(f) {
  const points = [];
  const mirrorz = await load(f)
  if (mirrorz === null)
    return points;

  let siteDisable = false;
  if ('disable' in mirrorz.site) {
    siteDisable = mirrorz.site.disable;
  }

  const site = new Point('site')
    .timestamp(cur)
    .tag('mirror', mirrorz.site.abbr)
    .tag('url', mirrorz.site.url)
    .intField('value', 1)
    .booleanField('disable', siteDisable);
  points.push(site)
  //console.log(` ${site}`)

  for (const m of mirrorz.mirrors) {
    let t = 0;
    const mapper = new Map();
    m.status.match(/[A-Z](\d+)?/g).map((s) => {
      const c = s[0];
      const t = s.length > 1 ? parseInt(s.substr(1)) : 0;
      mapper.set(c, t);
    });
    for (const c of ['S', 'O', 'F', 'P'])
      if (mapper.has(c) && mapper.get(c) != 0) {
        t = mapper.get(c) - Math.round(cur/1000); // must not equal 0, often less than 0
        break;
      }
    for (const c of [['C', 1000], ['R', 2000]])
      if (mapper.has(c[0]) && t == 0) {
        t = c[1];
        break;
      }
    // special cname, also collect lastupdate
    // disable for now as it is annoying for mirror sites
    //if (m.cname in REPO) {
    //  lastupdate = (await lload(m.cname, m.url.startsWith("http") ? m.url : mirrorz.site.url + m.url)) - Math.round(cur/1000);
    //  //console.log(mirrorz.site.url+m.url, lastupdate, t, lastupdate - t)
    //  if (!Number.isNaN(lastupdate)) {
    //    const repo_lastupdate = new Point('repo_lastupdate')
    //      .timestamp(cur)
    //      .tag('mirror', mirrorz.site.abbr)
    //      .tag('name', m.cname)
    //      .tag('url', m.url)
    //      .intField('value', lastupdate);
    //    points.push(repo_lastupdate)
    //    //console.log(` ${repo_lastupdate}`);
    //  } else {
    //    //console.log(mirrorz.site.url+m.url, lastupdate, t)
    //  }
    //  await new Promise(r => setTimeout(r, 1000)); // sleep for 1 sec
    //}

    let mirrorDisable = false;
    if (siteDisable) {
      // site.disable == true will override all mirror.disable
      mirrorDisable = siteDisable;
    } else {
      if ('disable' in m) {
        mirrorDisable = m.disable;
      }
    }

    const repo = new Point('repo')
      .timestamp(cur)
      .tag('mirror', mirrorz.site.abbr)
      .tag('name', m.cname)
      .tag('url', m.url)
      .intField('value', t)
      .booleanField('disable', mirrorDisable);
    points.push(repo)
    //console.log(` ${repo}`);
  }
  return points
}

async function main() {
  p = [];
  for (const f of LIST)
    p.push(write(f));
  Promise.all(p).then(async (v) => {
    const points = v.flat();
    //console.log(points.length)
    for (const p of points)
      writeApi.writePoint(p);
    Promise.all([
      writeApi.close(),
      writeInfluxDBV1(points),
    ])
      .then(() => {
        //console.log('FINISHED')
        process.exit(0);
      })
      .catch(e => {
        if (e instanceof HttpError && e.statusCode === 401) {
          console.log('Should setup a new InfluxDB database.')
        }
        console.log('\nFinished ERROR')
        process.exit(0);
      })
  });
}

main();
