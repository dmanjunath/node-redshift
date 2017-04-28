var pg = require('pg');
var Promise = require('bluebird');

/**
 * Redshift constructor function
 * @param {Object} config  connection object with {host, port, database, user, password}
 * @param {Object} options {rawConnection: <bool>}
 */
var Redshift = function (config, options) {
  if (config && typeof config === 'string' || typeof config === 'object') {
    var that = this;
    that.config = config;

    if (options && options.rawConnection) {
      that.connectionType = 'client';
      var client = new pg.Client(that.config);
      that.client = client;
    } else {
      that.connectionType = 'pool';
      that.pool = new pg.Pool(that.config);
      that.pool.on('error', function (err, client) {
        // if an error is encountered by a client while it sits idle in the pool
        // the pool itself will emit an error event with both the error and
        // the client which emitted the original error
        // this is a rare occurrence but can happen if there is a network partition
        // between your application and the database, the database restarts, etc.
        console.error('Redshift pg.Pool idle client error', err.message, err.stack)
      });
    }

    // unless there's an option disabling long stack traces, enable long stack traces
    if(!options || (options && (options.longStackTraces == undefined || options.longStackTraces === true))){
      Promise.config({
        longStackTraces: true
      });
    }

    // add additional pg modules to redshift object
    that.types = pg.types;
  } else {
    throw new Error('invalid Redshift connection configuration');
  }
};

// Close client or pool
Redshift.prototype.close = function (callback) {
  var that = this; //store original context of this because it will change inside callbacks
  if (that.connectionType && that.connectionType === 'client' && that.client) {
    that.client.end(callback);
  } else if (that.connectionType && that.connectionType === 'pool' && that.pool) {
    that.pool.end(callback);
    delete that.pool;
  }
};


Redshift.prototype.connect = function (callback) {
  var that = this;

  if (that.connectionType && that.connectionType === 'client' && that.client) {
    that.client.connect(callback);

  } else if (that.connectionType === 'pool') {
    callback(new Error("Don't call connect if using pools"));

  } else {
    callback(new Error("Couldn't connect to redshift. Invalid connection type"));
  }
};

module.exports = Redshift;