var pg = require('pg');

var Redshift = function(config){
  if(config && typeof config === 'string' || typeof config === 'object'){
    var that = this;
    that.config = config;

    // use connection pooling from pg module
    pg.connect(config, function(err, client, done) {
      if(err) {
        throw new Error('error fetching client from pool', err);
      }
      else {
        // store the client instance to make queries with
        that.client = client;

        // store done to call back so it can return connection back to pool
        // https://github.com/brianc/node-postgres#client-pooling
        that.done = done;
      }
    });
  }
  else{
    throw new Error('invalid Redshift connection configuration');
  }
};

module.exports = Redshift;