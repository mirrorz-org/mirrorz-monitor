// cname: async (repourl: string) => unix_timestamp: int
const REPO = {
  "archlinux": require("./archlinux"),
  "arch4edu": require("./arch4edu"),
  "archlinuxcn": require("./archlinuxcn"),
  "blackarch": require("./blackarch"),
  "anthon": require("./anthon"),
  "centos": require("./centos"),
  "centos-altarch": require("./centos-altarch"),
  "centos-vault": require("./centos-vault"),
  "ceph": require("./ceph"),
  "chakra": require("./chakra"),
  "CTAN": require("./CTAN"),
  "debian": require("./debian"),
  "debian-cd": require('./debian-cd'),
  "debian-security": require("./debian-security"),
  "deepin": require('./deepin'),
  "gnu": require("./gnu"),
  "gnu-alpha": require("./gnu-alpha"),
  "kali": require("./kali"),
  "kali-images": require("./kali-images"),
  "mageia": require("./mageia"),
  "manjaro": require("./manjaro"),
  "manjaro-arm": require("./manjaro-arm"),
  "mariadb": require("./mariadb"),
  "msys2": require("./msys2"),
  "postgresql": require("./postgresql"),
  "ubuntu": require("./ubuntu"),
  "ubuntu-releases": require("./ubuntu-releases"),
};

const lload = async (repo, url) => {
  // Timeout, timeout from parser/node.js
  return await Timeout.wrap(REPO[repo](url), timeout/3, 'Timeout').catch(() => NaN);
}

module.exports = {
  REPO,
  lload,
}
