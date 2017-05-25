var Redshift = require('../index.js');

var client = {
  user: 'user',
  database: 'database',
  password: 'password',
  port: 'port',
  host: 'host'
};

var redshift = new Redshift(client); //no need to call connect(), without rawConnection, it automatically connects

redshift.parameterizedQuery('SELECT * FROM "Tags" WHERE "id" = $1', ['42'], {raw: true})
.then(function(data){
  console.log(data); 
})
.catch(function(err){
  throw err;
});