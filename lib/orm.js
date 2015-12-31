var fs = require('fs');
var bricks = require("sql-bricks");

// convenience method:
function dbCall(redshiftClient, queryStr, callback) {
  redshiftClient.query(queryStr, function(err, data){
    if(err) callback(err);
    else {
      callback(null, data);
    }
  });
}

// ---------------------------------------

var ORM = function(redshiftClient) {
  this.tableName = null;
  this.tableProperties = null;
  this.redshiftClient = redshiftClient;
};

ORM.prototype.create = function(dat, cb) {
  var args = []; //this will store function args

  Array.prototype.push.apply(args, arguments);
  var data = args.shift(); //get query string which is first arg
  var callback = args.pop(); //get callback function which is last arg
  // var opts = null;
  // if(args && args[0]) opts = args[0]; // if there's an options arg, set it

  var queryStr = bricks.insert(this.tableName, dat).toString();

  dbCall(this.redshiftClient, queryStr, function(err, data){
    if(err) callback(err);
    else callback(null, data);
  }); 
};

// Person.update({id: 72}, {emailAddress: 'email@new.com'}, function(err, data){
//    
// });
ORM.prototype.update = function(whereClause, data, callback) {
  var queryStr = bricks.update(this.tableName, data).where(whereClause).toString();

  dbCall(this.redshiftClient, queryStr, function(err, data){
    if(err) callback(err);
    else callback(null, data);
  });
};

// Person.delete({id: 72}, function(err, data){
// })
ORM.prototype.delete = function(whereClause, callback) {
  var queryStr = bricks.delete(this.tableName).where(whereClause).toString();

  dbCall(this.redshiftClient, queryStr, function(err, data){
    if(err) callback(err);
    else callback(null, data);
  });
};
module.exports = ORM;