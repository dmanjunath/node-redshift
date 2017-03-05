var fs = require('fs');
var bricks = require("sql-bricks");
var Validate = require("./validation.js");

// convenience method:
function dbCall(redshiftClient, queryStr, callback) {
  redshiftClient.query(queryStr, function (err, data) {
    if (err) callback(err);
    else {
      callback(null, data);
    }
  });
}

// ---------------------------------------

var ORM = function (redshiftClient) {
  this.tableName = null;
  this.tableProperties = null;
  this.redshiftClient = redshiftClient;
};

/**
 * create a new instance of object
 * @param  {Object}   createObj Object or array of objects with keys/values to create in database. keys are column names, values are data
 * @param  {Function} cb   
 * @return {Object}             Object that's inserted into redshift
 *
 * Usage
 * Person.create({emailAddress: 'dheeraj@email.com', name: 'Dheeraj'}, function(err, data){
 *   if(err) throw err;
 *   else console.log(data);
 * });
 */
ORM.prototype.create = function (createObj, cb) {
  var args = []; //this will store function args
  var that = this;

  Array.prototype.push.apply(args, arguments);
  var data = args.shift(); //get query string which is first arg
  var callback = args.pop(); //get callback function which is last arg
  // var opts = null;
  // if(args && args[0]) opts = args[0]; // if there's an options arg, set it

  if (!Array.isArray(data)) {
    if (typeof data === 'object') {
      data = [data]; //cast to array
    } else {
      callback(new Error("Improper data format, please pass in either an array or object"));
    }
  }

  data.forEach(function (iter) {
    iter = Validate(that.tableProperties, iter);
  });
  var queryStr = bricks.insert(that.tableName, data).toString();

  dbCall(that.redshiftClient, queryStr, function (err, data) {
    if (err) {
      callback(err);
    } else {
      callback(null, data);
    }
  });
};


/**
 * update an existing item in redshift
 * @param  {Object}   whereClause The properties that identify the rows to update. Essentially the WHERE clause in the UPDATE statement
 * @param  {Object}   data        Properties to overwrite in the record
 * @param  {Function} callback    
 * @return {Object}               Object that's updated in redshift
 *
 * Usage
 * Person.update({id: 72}, {emailAddress: 'dheeraj@email.com', name: 'Dheeraj'}, function(err, data){
 *   if(err) throw err;
 *   else console.log(data);
 * })
 */
ORM.prototype.update = function (whereClause, data, callback) {
  data = Validate(this.tableProperties, data);
  var queryStr = bricks.update(this.tableName, data).where(whereClause).toString();

  dbCall(this.redshiftClient, queryStr, function (err, data) {
    if (err) {
      callback(err);
    } else {
      callback(null, data);
    }
  });
};

// Person.delete({id: 72}, function(err, data){
// })

/**
 * delete rows from redshift
 * @param  {Object}   whereClause The properties that identify the rows to update. Essentially the WHERE clause in the UPDATE statement
 * @param  {Function} cb   
 * @return {Object}        Object that's deleted from redshift
 *
 * Usage
 * Person.delete({emailAddress: 'dheeraj@email.com', name: 'Dheeraj'}, function(err, data){
 *   if(err) throw err;
 *   else console.log(data);
 * });
 */
ORM.prototype.delete = function (whereClause, callback) {
  var queryStr = bricks.delete(this.tableName).where(whereClause).toString();

  dbCall(this.redshiftClient, queryStr, function (err, data) {
    if (err) {
      callback(err);
    } else {
      callback(null, data);
    }
  });
};
module.exports = ORM;