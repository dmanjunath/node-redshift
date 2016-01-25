## Overview
This package is a simple wrapper for common functionality you want when using Redshift. It can do
- Redshift connections & querying
- Creating and running migrations
- Create and manage models

Warning!!!!!! This is new and still under development. The API is bound to change. Use at your own risk.

## Setup
#### Establishing a Redshift connection and querying
```javascript
//redshift.js
var Redshift = require('node-redshift');

var client = {
  user: user,
  database: database,
  password: password,
  port: port,
  host: host,
};

var redshiftClient = new Redshift(client);

module.exports = redshiftClient;
```
#### Usage
The redshift.js file exports a Redshift object which has a `query()` function bound to it you can call with the string of a sql query. I like [sql-bricks](http://csnw.github.io/sql-bricks/) to build queries.
```javascript
var redshiftClient = require('./redshift.js');

// options is an optional object with one property so far {raw: true} returns 
// just the data from redshift. {raw: false} returns the data with the pg object
redshiftClient.query(queryString, [options], callback);
```

#### CLI usage to create and run migrations
There's a CLI with options for easy migration management. Creating a migration will create a `redshift_migrations/` folder with a state file called `.migrate` in it which contains the state of your completed migrations. The .migrate file keeps track of which migrations have been run, and when you run db:migrate, it computes the migrations that have not yet been run on your Redshift instance and runs them and saves the state of `.migrate`

WARNING!!! IF YOU HAVE SEPARATE DEV AND PROD REDSHIFT INSTANCES, DO NOT COMMIT THE `.migrate` FILE TO YOUR VCS OR DEPLOY TO YOUR SERVERS. YOU'LL NEED A NEW VERSION OF THIS FILE FOR EVERY INSTANCE OF REDSHIFT.
```javascript
//Create a new migration file in redshift_migrations/ folder
node_modules/.bin/node-redshift migration:create

//Run all remaining migrations on database
node_modules/.bin/node-redshift db:migrate
```

## Creating Models
### Creating a model using the command line
```
node_modules/.bin/node-redshift migration:create <filename>
```

A model will look like this
```
'use strict';
  var person = {
    'tableName': 'people',
    'tableProperties': {
      'id': {
        'type': 'key'
      },
      'name': { 
        'type': 'string',
        'required': true
      },
      'email': { 
        'type': 'string',
        'required': true
      }
    }
  };
  module.exports = person;
```
### Importing and using model with ORM
Import a model into a file as such
```
var redshift = require("../redshift.js");
var person = redshift.import("./redshift_models/person.js");

person.create({name: 'Dheeraj', email: 'dheeraj@email.com'}, function(err, data){
    if(err) throw err;
    else{
      console.log(data);
    }
  });
```

### ORM API
There are 4 functions supported by the ORM
```
/**
 * create a new instance of object
 * @param  {Object}   data Object with keys/values to create in database. keys are column names, values are data
 * @param  {Function} cb   
 * @return {Object}        Object that's inserted into redshift
 */
Person.create({emailAddress: 'dheeraj@email.com', name: 'Dheeraj'}, function(err, data){
  if(err) throw err;
  else console.log(data);
});
 
/**
 * update an existing item in redshift
 * @param  {Object}   whereClause The properties that identify the rows to update. Essentially the WHERE clause in the UPDATE statement
 * @param  {Object}   data        Properties to overwrite in the record
 * @param  {Function} callback    
 * @return {Object}               Object that's updated in redshift
 *
 */
Person.update({id: 72}, {emailAddress: 'dheeraj@email.com', name: 'Dheeraj'}, function(err, data){
  if(err) throw err;
  else console.log(data);
});

/**
 * delete rows from redshift
 * @param  {Object}   whereClause The properties that identify the rows to update. Essentially the WHERE clause in the UPDATE statement
 * @param  {Function} cb   
 * @return {Object}        Object that's deleted from redshift
 */
Person.delete({emailAddress: 'dheeraj@email.com', name: 'Dheeraj'}, function(err, data){
  if(err) throw err;
  else console.log(data);
});
```

## Upcoming features
- Ability to customize location of `.migrate` file or even from S3
- Model checking prior to queries to verify property name and type
- Add class & instance methods to model

## License
MIT