const timestamp = require("./timestamp");
module.exports = async function (repoUrl) {
  return await timestamp(repoUrl + "/timestamp");
};
