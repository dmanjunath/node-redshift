var Redshift = require('../index.js');

var client = {
  user: 'user',
  database: 'database',
  password: 'password',
  port: 'port',
  host: 'host'
};

var redshift = new Redshift(client); //no need to call connect(), without rawConnection, it automatically connects

// using callbacks
redshift.query('SELECT * FROM "Tags"', {raw: true}, function(err, data){
  if(err) throw err;
  else{
    console.log(data);

    // if you want to close client pool, uncomment redshift.close() line
    // but you won't be able to make subsequent calls because connection is terminated
    // redshift.close();
  }
});

// using promises
redshift.query('SELECT * FROM "Tags"', {raw: true})
.then(function(data){
  console.log(data);

  // if you want to close client pool, uncomment redshift.close() line
  // but you won't be able to make subsequent calls because connection is terminated
  // redshift.close();
}, function(err){
  throw err;
});