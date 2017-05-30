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

  // if last arg is callback, set cb to callback reference
  if(lastArg && typeof lastArg === 'function'){
    cb = lastArg;
    
    // if there's also an options arg, set it to opts
    if (args && args[0]) {
      opts = args[0];
    }
  }
  // if there's options but no callback
  else if(lastArg && typeof lastArg === 'object') opts = lastArg;
  // there's something but it's neither an object nor a function, so alert the user
  else if(lastArg) throw new Error("Invalid function signature in node-redshift query function");

  return _queryHelper(that, query, null, opts).asCallback(cb);
};

Redshift.prototype.parameterizedQuery = function (query, parameters, options, callback) {
  var that = this; //store original context of this because it will change inside callbacks
  var args = []; //this will store function args

  Array.prototype.push.apply(args, arguments);
  var q = args.shift(); //get query string which is first arg
  var parameters = args.shift(); //parameters is the required second arg
  var lastArg = args.pop(); //get callback function which is last arg
  var cb = null;
  var opts = null;

  // if last arg is callback, set cb to callback reference
  if(lastArg && typeof lastArg === 'function'){
    cb = lastArg;
    
    // if there's also an options arg, set it to opts
    if (args && args[0]) {
      opts = args[0];
    }
  }
  // if there's options but no callback
  else if(lastArg && typeof lastArg === 'object') opts = lastArg;
  // there's something but it's neither an object nor a function, so alert the user
  else if(lastArg) throw new Error("Invalid function signature in node-redshift parameterizedQuery function");

  return _queryHelper(that, query, parameters, opts).asCallback(cb);
};

/**
 * This function just accepts the same parameters as query, but it creates a connection, makes a query and disconnects immediately
 * @param  {String}   query    query string
 * @param  {Object}   options  optional - raw: true returns just the data instead of the metadata from node-pg query
 * @param  {Function} callback called when done
 */
Redshift.prototype.rawQuery = function(query, options, callback){
  var that = this; //store original context of this because it will change inside callbacks
  var args = []; //this will store function args
  var config = that.config;

  Array.prototype.push.apply(args, arguments);
  var q = args.shift(); //get query string which is first arg
  var lastArg = args.pop(); //get callback function which is last arg
  var cb = null;
  var opts = null;

  // if last arg is callback, set cb to callback reference
  if(lastArg && typeof lastArg === 'function'){
    cb = lastArg;
    
    // if there's also an options arg, set it to opts
    if (args && args[0]) {
      opts = args[0];
    }
  }
  // if there's options but no callback
  else if(lastArg && typeof lastArg === 'object') opts = lastArg;
  // there's something but it's neither an object nor a function, so alert the user
  else if(lastArg) throw new Error("Invalid function signature in node-redshift rawQuery function");

  var p  = new Promise(function(resolve, reject){
    // the reason there's a new redshift connection is there could potentially be some race conditions if the same
    // redshift client that's passed in is connected and disconnected over and over
    var redshiftTemp = new Redshift(config, {rawConnection: true});
    redshiftTemp.connect(function(err){

      if(err) throw new Error("error connecting to redshift for rawQuery");
      else{
        runQuery(redshiftTemp, redshiftTemp.client, q, null, options, resolve, reject, null, true);
      }
    });
  });
  
  return p.asCallback(cb);
};

function _queryHelper(that, query, parameters, opts){
  var p  = new Promise(function(resolve, reject){
    // check if client exists in case we are not in pool mode
    if (that && that.connectionType && that.connectionType === 'client' && !that.client) {
      throw new Error("No client, please call connect first");
    }

    if (that && that.connectionType && that.connectionType === 'client') {
      runQuery(that, that.client, query, parameters, opts, resolve, reject);

    } else if (that && that.connectionType && that.connectionType === 'pool') {
      that.pool.connect(function (err, client, done) {
        if (err) {
          done(client);
          reject(new Error(err));
        } else {
          runQuery(that, client, query, parameters, opts, resolve, reject, done);
        }
      });

    } else {
      throw new Error("Neither client or pool mode, this should never happen");
    }
  });

  return p
}

/**
 * Run query helper function
 * @param  {Object}   that         reference to 'this' context of calling function
 * @param  {Object}   client       pg client
 * @param  {String}   query        querystring
 * @param  {String}   parameters   options if parameterized
 * @param  {Object}   opts         user defined properties
 * @param  {Object}   resolve      promise - resolve function
 * @param  {Object}   reject       promise - reject function
 * @param  {Function} done         releases client back to the pool, does NOT call calback or resolve promise
 */
function runQuery(that, client, query, parameters, opts, resolve, reject, done, endConnection) {
  client.query(query, parameters, function (err, data) {
    if (that.connectionType && that.connectionType === 'pool') {
      done(client); // release client back to pool
    }

    if(endConnection && that.connectionType && that.connectionType === 'client'){
      that.close();
    }

    if (err) {
      reject(err);
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