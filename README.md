## Navigation

#### [Overview](https://github.com/dmanjunath/node-redshift#overview-1)

#### [Installation](https://github.com/dmanjunath/node-redshift#installation-1)

#### [Setup](https://github.com/dmanjunath/node-redshift#setup-1)

#### [Usage](https://github.com/dmanjunath/node-redshift#usage-1)

- #### [Query API](https://github.com/dmanjunath/node-redshift#query-api-2)
- #### [CLI](https://github.com/dmanjunath/node-redshift#cli-2)
- #### [Models](https://github.com/dmanjunath/node-redshift#models-2)
- #### [ORM](https://github.com/dmanjunath/node-redshift#orm-api)

#### [Upcoming Features](https://github.com/dmanjunath/node-redshift#upcoming-features-1)

#### [License](https://github.com/dmanjunath/node-redshift#license-1)

## Overview
This package is a simple wrapper for common functionality you want when using Redshift. It can do
- Redshift connections & querying
- Creating and running migrations
- Create and manage models
- CRUD API with ORM wrapper with type validation

Warning!!!!!! This is new and still under development. The API is bound to change. Use at your own risk.

## Installation
Install the package by running
```javascript
npm install node-redshift
```
Link to npm repository https://www.npmjs.com/package/node-redshift

## Setup

The code to connect to redshift should be something like this:
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

// The values passed in to the options object will be the difference between a connection pool and raw connection
var redshiftClient = new Redshift(client, [options]);

module.exports = redshiftClient;
```

There are two ways to setup a connection to redshift. 

- [Connection Pooling](https://github.com/dmanjunath/node-redshift#connection-pooling) -  you can open a connection pool and open connections to Redshift which will be managed by pg-pool (https://github.com/brianc/node-pg-pool)
- [Raw Connection](https://github.com/dmanjunath/node-redshift#raw-connection) - a one time connection you must manually initialize and close to run queries


###### ***By default node-redshift uses connection pooling

#### 
##### Raw Connection
Pass in the rawConnection parameter in the redshift instantiation options to specify a raw connection. Raw connections need extra code to specify when to connect and disconnect from Redshift. [Here's an example of the raw connection query](https://github.com/dmanjunath/node-redshift/blob/master/examples/raw_connection.js)

```javascript
var redshiftClient = new Redshift(client, {rawConnection: true});
```

##### Connection Pooling 
Connection pooling works by default with no extra configuration. [Here's an example of connection pooling](https://github.com/dmanjunath/node-redshift/blob/master/examples/connection_pooling.js)

##### Setup Options
There are two options that can be passed into the options object in the Redshift constructor.

| Option                | Type          | Description                                                                       |
| --------------------- |:-------------:| ---------------------------------------------------------------------------------:|
| rawConnection         | Boolean       | If you want a raw connection, pass true with this option                          |
| longStackTraces       | Boolean       | Default: true. If you want to disable [bluebird's longStackTraces](http://bluebirdjs.com/docs/api/promise.longstacktraces.html), pass in false   |


## Usage

#### [Query API](https://github.com/dmanjunath/node-redshift#query-api-2)
#### [CLI](https://github.com/dmanjunath/node-redshift#cli-2)
#### [Models](https://github.com/dmanjunath/node-redshift#models-2)
#### [ORM](https://github.com/dmanjunath/node-redshift#orm-api)
#
### Query API
Please see examples/ folder for full code examples using both raw connections and connection pools.

For those looking for a library to build robust, injection safe SQL, I like [sql-bricks](http://csnw.github.io/sql-bricks/) to build query strings.

Both Raw Connections and Connection Pool connections have two query functions that are bound to the initialized Redshift object: `query()` and a `parameterizedQuery()`.

All `query()` and `parameterizedQuery()` functions support **both callback and promise style**. If there's a function as a third argument, the callback will fire. If there's no third function argument, but instead (query, [options]).then({})... the promise will fire.

```javascript
//raw connection
var redshiftClient = require('./redshift.js');

redshiftClient.connect(function(err){
  if(err) throw err;
  else{
    redshiftClient.query('SELECT * FROM "TableName"', [options], function(err, data){
      if(err) throw err;
      else{
        console.log(data);
        redshiftClient.close();
      }
    });
  }
});
```
#
```javascript
//connection pool
var redshiftClient = require('./redshift.js');

// options is an optional object with one property so far {raw: true} returns 
// just the data from redshift. {raw: false} returns the data with the pg object
redshiftClient.query(queryString, [options])
.then(function(data){
    console.log(data);
})
.catch(function(err){
    console.error(err);
});
//instead of promises you can also use callbacks to get the data
```

##### Parameterized Queries 
If you parameterize the SQL string yourself, you can call the `parameterizeQuery()` function 
```javascript
//connection pool
var redshiftClient = require('./redshift.js');

// options is an optional object with one property so far {raw: true} returns 
// just the data from redshift. {raw: false} returns the data with the pg object
redshiftClient.parameterizedQuery('SELECT * FROM "TableName" WHERE "parameter" = $1', [42], [options], function(err, data){
  if(err) throw err;
  else{
    console.log(data);
  }
});
//you can also use promises to get the data
```

##### Template Literal Queries 
If you use template literals to write your SQL, you can use a tagged template parser like https://github.com/felixfbecker/node-sql-template-strings to parameterize the template literal
```javascript
//connection pool
var redshiftClient = require('./redshift.js');
var SQL = require('sql-template-strings');

// options is an optional object with one property so far {raw: true} returns 
// just the data from redshift. {raw: false} returns the data with the pg object
let value = 42;

redshiftClient.query(SQL`SELECT * FROM "TableName" WHERE "parameter" = ${value}`, [options], function(err, data){
  if(err) throw err;
  else{
    console.log(data);
  }
});
//you can also use promises to get the data
```

##### `rawQuery()` 
If you want to make a one time raw query, but you don't want to call connect & disconnect manually and you dont want to use conection pooling, you can use `rawQuery()`
```javascript
//connection pool
var redshiftClient = require('./redshift.js');

// options is an optional object with one property so far {raw: true} returns 
// just the data from redshift. {raw: false} returns the data with the pg object
redshiftClient.rawQuery('SELECT * FROM "TableName"', [options], function(err, data){
  if(err) throw err;
  else{
    console.log(data);
  }
});
//you can also use promises to get the data
```

##### Query Options 
There's only a single query option so far. For the options object, the only valid option is {raw: true}, which returns just the data from redshift. {raw: false} or not specifying the value will return the data along with the entire pg object with data such as row count, table statistics etc.


### CLI
There's a CLI with options for easy migration management. Creating a migration will create a `redshift_migrations/` folder with a state file called `.migrate` in it which contains the state of your completed migrations. The .migrate file keeps track of which migrations have been run, and when you run db:migrate, it computes the migrations that have not yet been run on your Redshift instance and runs them and saves the state of `.migrate`

WARNING!!! IF YOU HAVE SEPARATE DEV AND PROD REDSHIFT INSTANCES, DO NOT COMMIT THE `.migrate` FILE TO YOUR VCS OR DEPLOY TO YOUR SERVERS. YOU'LL NEED A NEW VERSION OF THIS FILE FOR EVERY INSTANCE OF REDSHIFT.

##### Create a new migration file in redshift_migrations/ folder
#
```
node_modules/.bin/node-redshift migration:create <filename>
```

##### Run all remaining migrations on database
#
```
node_modules/.bin/node-redshift db:migrate <filename>
```

##### Undo last migration
#
```
node_modules/.bin/node-redshift db:migrate:undo <filename>
```

##### Creating a model using the command line
#
```
node_modules/.bin/node-redshift model:create <filename>
```

### Models

A model will look like this
```javascript
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
##### Importing and using model with ORM
#
There are two ways you could import and use redshift models. The first is using redshift.import in every file where you want to use the model ORM.
```javascript
var redshift = require("../redshift.js");
var person = redshift.import("./redshift_models/person.js");

person.create({name: 'Dheeraj', email: 'dheeraj@email.com'}, function(err, data){
    if(err) throw err;
    else{
      console.log(data);
    }
  });
```

The alternative(my preferred way) is to abstract the import calls and export all the models with the redshift object right after initialization

```javascript
//redshift.js
...redshift connection code...

var person = redshift.import("./redshift_models/person.js");
redshift.models = {};
redshift.models.person = person;

module.exports = redshift;

//usage in person.js
var redshiftConnection = require('./redshift.js');
var person = redshift.models.person;

person.create({name: 'Dheeraj', email: 'dheeraj@email.com'}, function(err, data){
    if(err) throw err;
    else{
      console.log(data);
    }
  });
```

### ORM API
There are 3 functions supported by the ORM
```javascript
/**
 * create a new instance of object
 * @param  {Object or Array}   data Object/Array with keys/values to create in database. keys are column names, values are data
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
