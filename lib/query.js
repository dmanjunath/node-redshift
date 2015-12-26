var Redshift = require('./connection.js');

Redshift.prototype.query = function(query, options, callback){
  var args = [];
  Array.prototype.push.apply(args, arguments);
  var q = args.shift();
  var cb = args.pop();
  var opts = null;
  if(args && args[0]) opts = args[0];

  this.client.query(q, function(err, data){
    if(err) throw new Error("Error while querying redshift", query, err);
    else{
      if(opts && opts.raw === true) cb(null, data.rows);
      else cb(null, data);
    }
  });
};

module.exports = Redshift.prototype.query;