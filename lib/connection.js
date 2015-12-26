/*global arguments*/
var pg = require('pg');

var Redshift = function(config){
  this.config = config;
  if(config && typeof config === 'string' || typeof config === 'object'){
    this.config = config;
    var client = new pg.Client(this.config);

    client.connect(function(err) {
      if(err) {
        throw err;
      }
    });

    this.client = client;
  }
  else{
    throw new Error('invalid Redshift connection configuration');
  }
};

module.exports = Redshift;