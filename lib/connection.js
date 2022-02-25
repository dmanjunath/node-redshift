var pg = require('pg');
var Promise = require('bluebird');
var pgp = require("pg-promise");
var Redshift = function (config, options) {
  console.log(config)
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
var connections = [];
Redshift.prototype.connectRedShift = function (callback) {
  const dbName = "gti_dw";

    if (!connections[dbName]) {
        const dbUser = "karthikeyan_b";
        const dbPassword = "KarthikeyanB2021";
        const dbHost = "gti-dw-dev.cskoof8zzowd.us-east-1.redshift.amazonaws.com";
        const dbPort = "5439";

        const dbc = pgp({ capSQL: true });
        console.log(`Opening connection to: ${dbName}, host is: ${dbHost}`);

        const connectionString = `postgres://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
        connections[dbName] = dbc(connectionString);
    }

    callback(connections[dbName]);
};

Redshift.prototype.createQuery = function (req) {
  if (req.query) {
    return req.query;
  }
  var schemaName = req.Schema_Name;
  var tableName = req.Table_Name;
  var filter_rows = req.filter? JSON.parse(req.filter): [];
  var filter_columns = req.columns_list ? JSON.parse(req.columns_list): [];
  // console.log(schemaName, tableName, typeof (filter_columns), typeof (filter_rows));
  var query = "select "
  if (filter_columns.length > 0) {
    for (var i = 0; i < filter_columns.length; i++){
      if (filter_columns.length - 1 != i) {
        query += filter_columns[i] + ",";
      } else {
        query += filter_columns[i] + " ";
      }
    }
    query += "from ";
  } else {
    query += "* from ";
  }
  if (schemaName) {
    query += schemaName + ".";
  }
  if (tableName) {
    query += tableName + "";
  }
  if (filter_rows.length > 0) {
    query += " where "
    for (var i = 0; i < filter_rows.length; i++){
      if (filter_rows.length - 1 != i) {
        query += filter_rows[i]["key"] + "=" + filter_rows[i]["value"] + " and ";
      } else {
        query += filter_rows[i]["key"] + "=" + filter_rows[i]["value"] + "";
      }
    }
  } else {
    query += "";
  }
  return query;
}

module.exports = Redshift;