var Redshift = require('./connection.js');

Redshift.prototype.queryPromise = function (query, options) {
  return new Promise((resolve, reject) => {
    this.query(query, options, function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    })
  })
};
