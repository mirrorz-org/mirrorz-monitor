const config = require("../config/config.json");

const { init, load } = require("../config/parser/node");
init(config, "mirrorz-monitor"); // global.fetch, global.DOMParser, global.Timeout, global.timeout
const parsers = require("../config/parser/parsers");

const LIST = config.mirrors.map((e) => parsers[e]);

module.exports = { LIST, load };
