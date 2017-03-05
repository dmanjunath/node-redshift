var Redshift = require('./connection.js');

Redshift.prototype.query = function (query, options, callback) {
  var that = this; //store original context of this because it will change inside callbacks
  var args = []; //this will store function args

  Array.prototype.push.apply(args, arguments);
  var q = args.shift(); //get query string which is first arg
  var cb = args.pop(); //get callback function which is last arg
  var opts = null;

  // if there's an options arg, set it
  if (args && args[0]) {
    opts = args[0];
  }

  // check if client exists in case we are not in pool mode
  if (that && that.connectionType && that.connectionType === 'client' && !that.client) {
    throw new Error("No client, please call connect first");
  }

  if (that && that.connectionType && that.connectionType === 'client') {
    runQuery(that, that.client, query, opts, cb);

  } else if (that && that.connectionType && that.connectionType === 'pool') {
    that.pool.connect(function (err, client, done) {
      if (err) {
        done(client);
        cb(err);

      } else {
        runQuery(that, client, query, opts, cb, done);
      }
    });

  } else {
    throw new Error("Neither client or pool mode, this should never happen");
  }
};

function runQuery(that, client, query, opts, cb, done) {
  client.query(query, function (err, data) {
    if (that.connectionType && that.connectionType === 'pool') {
      done(err); // release client back to pool
    }

    if (err) {
      cb(err);
    } else {
      if (opts && opts.raw === true) {
        cb(null, data.rows);
      } else {
        cb(null, data);
      }
    }
  });
}

module.exports = Redshift.prototype.query;