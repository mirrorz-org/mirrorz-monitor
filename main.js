const { LIST, load } = require("./lib/monitor");

const {Point} = require('@influxdata/influxdb-client')
const {
  url, token, database, username, password,
} = require('./env')

const cur = new Date();

async function writeInfluxDB(points) {
  const endpoint = new URL('/write', url);
  endpoint.searchParams.set('db', database);
  endpoint.searchParams.set('precision', 'ns');

  const headers = {'Content-Type': 'text/plain; charset=utf-8'};
  if (username || password) {
    headers.Authorization = 'Basic ' + Buffer
      .from(`${username}:${password}`)
      .toString('base64');
  } else if (token) {
    headers.Authorization = `Token ${token}`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: points.map((point) => point.toLineProtocol()).join('\n'),
  });
  if (!response.ok) {
    const message = await response.text();
    const error = new Error(`InfluxDB write failed: HTTP ${response.status}: ${message}`);
    error.status = response.status;
    throw error;
  }
}

async function write(f) {
  const points = [];
  const normalizeIndexes = new Map();
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
    (m.status?.match(/[A-Z](\d+)?/g) ?? []).map((s) => {
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
      mirrorDisable = m.disable ?? false;
    }

    let repoPrivate = m.private ?? false;

    const rules = m.rules || [];
    const repo = new Point('repo')
      .timestamp(cur)
      .tag('mirror', mirrorz.site.abbr)
      .tag('name', m.cname)
      .tag('url', m.url)
      .intField('value', t)
      .booleanField('disable', mirrorDisable)
      .booleanField('private', repoPrivate)
      .stringField('mirrorlist_path', m.mirrorlist_path ?? m.url);
    points.push(repo);

    for (const [index, rule] of rules.filter(rule => rule.type).entries()) {
      points.push(new Point('rule')
          .timestamp(cur)
          .tag('mirror', mirrorz.site.abbr)
          .tag('name', m.cname)
          .tag('index', String(index))
          .stringField('type', rule.type)
          .stringField('match', rule.match)
          .stringField('target', rule.target)
          .stringField('scope', rule.scope || m.cname));
    }

    for (const { scope, normalize } of rules.filter(rule => rule.normalize)) {
      const name = scope || m.cname;
      const index = normalizeIndexes.get(name) || 0;
      normalizeIndexes.set(name, index + 1);
      points.push(new Point('normalize')
        .timestamp(cur)
        .tag('mirror', mirrorz.site.abbr)
        .tag('name', name)
        .tag('index', String(index))
        .stringField('type', normalize.type)
        .stringField('match', normalize.match)
        .stringField('target', normalize.target)
        .stringField('scope', normalize.scope || m.cname));
    }

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
    writeInfluxDB(points)
      .then(() => {
        //console.log('FINISHED')
        process.exit(0);
      })
      .catch(e => {
        if (e.status === 401) {
          console.log('Should setup a new InfluxDB database.')
        }
        console.error('\nFinished ERROR', e)
        process.exit(1);
      })
  });
}

main();
