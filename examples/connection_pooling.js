var Redshift = require('../index.js');

var client = {
  user: 'user',
  database: 'database',
  password: 'password',
  port: 'port',
  host: 'host'
};

var redshift = new Redshift(client); //no need to call connect(), without rawConnection, it automatically connects

redshift.query('SELECT * FROM "Tags"', {raw: true}, function(err, data){
  if(err) throw err;
  else{
    console.log(data);
    //if you want to close client pool
    // but you won't be able to make subsequent calls because connection is terminated
    redshift.close();
  }
});