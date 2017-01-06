var pg = require('pg');

/**
 * Redshift constructor function
 * @param {Object} config  connection object with {host, port, database, user, password}
 * @param {Object} options {rawConnection: <bool>}
 */
var Redshift = function(config, options){
  if(config && typeof config === 'string' || typeof config === 'object'){
    var that = this;
    that.config = config;

    if(options && options.rawConnection){
      that.connectionType = 'client';
      var client = new pg.Client(config);
      that.client = client;
    }
    else{
      that.connectionType = 'pool';
      // use connection pooling from pg module
      var pool = new pg.Pool(config);
      pool.connect(function(err, client, done) {
        if(err) {
          done(client); //https://github.com/brianc/node-postgres/wiki/Example
          throw err;
        }
        else {
          // store the client instance to make queries with
          that.client = client;
          that.pool = pool;

          // store done to call back so it can return connection back to pool
          // https://github.com/brianc/node-postgres#client-pooling
          that.done = done;
        }
      });
    }
  }
  else{
    throw new Error('invalid Redshift connection configuration');
  }
};

// connection functions for client pooling
Redshift.prototype.close = function(callback){
  var that = this; //store original context of this because it will change inside callbacks
  if(that.connectionType && that.connectionType === 'client' && that.client) that.client.end(callback);
  else if(that.connectionType && that.connectionType === 'pool' && that.pool) that.pool.end();
};

Redshift.prototype.connect = function(callback){
  var that = this;
  if(that.connectionType && that.client){
    that.client.connect(callback);
  }
  else callback(new Error("Can't connect to database manually without usuing manual connection parameter rawConnection. Please add rawConnection to your config."));
};

module.exports = Redshift;
