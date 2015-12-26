var pg = require('pg');

var Redshift = function(config){
  this.config = config;
  if(config && typeof config === 'string' || typeof config === 'object'){
    var that = this;
    this.config = config;

    pg.connect(this.config, function(err, client, done) {
      if(err) {
        that.hasConnectionError = true;
        throw new Error('error fetching client from pool', err);
      }
      else {
        that.client = client;
        that.done = done;
      }
    });
  }
  else{
    throw new Error('invalid Redshift connection configuration');
  }
};

module.exports = Redshift;