var Redshift = require('./connection.js');

Redshift.prototype.query = function(query, options, callback){
  var that = this; //store original context of this because it will change inside callbacks
  var args = []; //this will store function args

  Array.prototype.push.apply(args, arguments);
  var q = args.shift(); //get query string which is first arg
  var cb = args.pop(); //get callback function which is last arg
  var opts = null;
  if(args && args[0]) opts = args[0]; // if there's an options arg, set it

  // check if client exists. if it does, run query
  // but if an application tries to call query before the connection
  // is established, set an interval and poll at 50ms to see if the client exists
  // once it does, clear the interval and run query
  if(that && !that.client){
    var count = 0;
    var intId = setInterval(function(){
      if(that && that.client){
        clearInterval(intId);
        runQuery(that, q, opts, cb);
      }
      else{
        count = count + 1; // count the attempts
        if(count > 600){ // and after 1 min, give up
          clearInterval(intId);
          throw new Error("Taking too long to estable connection or unable to make query");
        }
      }
    }, 100);
  }
  else runQuery(that, q, opts, cb);
};

function runQuery(that, q, opts, cb){
  that.client.query(q, function(err, data){
    if(err) cb(err);
    else{
      that.done();
      if(opts && opts.raw === true) cb(null, data.rows);
      else cb(null, data);
    }
  });
}

module.exports = Redshift.prototype.query;