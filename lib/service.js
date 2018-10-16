const detectPort = require('detect-port');

exports.stickyWorker = function stickyWorker(ip) {
  let s = '';
  for (let i = 0; i < ip.length; i++) {
    if (!isNaN(ip[i])) s += ip[i];
  }
  return Number(s);
};

exports.checkPortCanUse = function checkPortCanUse(port) {
  return new Promise((resolve, reject) => {
    const args = [];
    if (port) {
      args.push(port);
    }
    args.push((err, port) => {
      if (err) {
        err.name = 'ClusterPortConflictError';
        err.message = '[master] try get free port error, ' + err.message;
        return reject(err);
      }
      resolve(port);
    });
    detectPort(...args);
  });
};

exports.processArgvFormatter = argvs => {
  const result = {};
  for (let i = 0; i < argvs.length; i++) {
    processArgvResolve(argvs[i], result);
  }
  return result;
};

function processArgvResolve(str, res) {
  if (/^\-\-/.test(str)) {
    str = str.replace(/^\-\-/, '');
    processArgvResolveArguments(str, res);
  }
}

function processArgvResolveArguments(str, res) {
  const colums = str.split('=');
  if (colums.length === 2) {
    const dots = colums[0].split('.');
    if (dots.length === 1) {
      res[dots[0]] = colums[1];
    } else {
      const l = dots.slice(0, -1);
      const r = dots.slice(-1)[0];
      let i = 0, t = res;
      while (i < l.length) {
        const v = l[i];
        if (!t[v]) t[v] = {};
        t = t[v];
        ++i;
      }
      t[r] = colums[1];
    }
  }
}