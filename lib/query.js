var Redshift = require('./connection.js');

Redshift.prototype.query = function(query, options, callback){
  var args = [];
  Array.prototype.push.apply(args, arguments);
  var q = args.shift();
  var cb = args.pop();
  var opts = null;
  if(args && args[0]) opts = args[0];
  var that = this;

  if(that.hasConnectionError || !that.client){
    var intId = setInterval(function(){
      if(that && that.client){
        clearInterval(intId);
        runQuery(that, q, opts, cb);
      }
    }, 50);
  }
  else runQuery(that, q, opts, cb);
};

function runQuery(that, q, opts, cb){
  that.client.query(q, function(err, data){
    if(err) throw new Error("Error while querying redshift", query, err);
    else{
      that.done();
      if(opts && opts.raw === true) cb(null, data.rows);
      else cb(null, data);
    }
  });
}

module.exports = Redshift.prototype.query;