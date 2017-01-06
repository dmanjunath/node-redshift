var Redshift = require('../index.js');

var client = {
  user: 'user',
  database: 'database',
  password: 'password',
  port: 'port',
  host: 'host'
};

var redshift = new Redshift(client, {rawConnection: true});

redshift.connect(function(err){ //create connection manually
  if(err) throw err;
  else{
    redshift.query('SELECT * FROM "Tags"', {raw: true}, function(err, data){ //query redshift
      if(err) throw err;
      else{
        console.log(data);
        redshift.close(); //close connection manually
      }
    });
  }
});