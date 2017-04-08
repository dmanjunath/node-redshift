var Redshift = require('./connection.js');
var Promise = require('bluebird');

Redshift.prototype.query = function (query, options, callback) {
  var that = this; //store original context of this because it will change inside callbacks
  var args = []; //this will store function args

  Array.prototype.push.apply(args, arguments);
  var q = args.shift(); //get query string which is first arg
  var lastArg = args.pop(); //get callback function which is last arg
  var cb = null;
  var opts = null;

  if(lastArg && typeof lastArg === 'function') cb = lastArg;
  else if(lastArg && typeof lastArg === 'object') opts = lastArg;
  else if(lastArg) throw new Error("Invalid function signature in node-redshift query function");

  var p  = new Promise(function(resolve, reject){
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
          reject(new Error(err));
        } else {
          runQuery(that, client, query, opts, resolve, reject, done);
        }
      });

    } else {
      throw new Error("Neither client or pool mode, this should never happen");
    }
  });

  return p.asCallback(callback);
};

/**
 * Run query helper function
 * @param  {Object}   that    reference to 'this' context of calling function
 * @param  {Object}   client  pg client
 * @param  {String}   query   querystring
 * @param  {Object}   opts    user defined properties
 * @param  {Object}   resolve promise - resolve function
 * @param  {Object}   reject  promise - reject function
 * @param  {Function} done    releases client back to the pool, does NOT call calback or resolve promise
 */
function runQuery(that, client, query, opts, resolve, reject, done) {
  client.query(query, function (err, data) {
    if (that.connectionType && that.connectionType === 'pool') {
      done(err); // release client back to pool
    }

    if (err) {
      reject(new Error(err));
    } else {
      if (opts && opts.raw === true) {
        resolve(data.rows);
      } else {
        resolve(data);
      }
    }
  });
}

module.exports = Redshift.prototype.query;