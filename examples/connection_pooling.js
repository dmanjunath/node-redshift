var Redshift = require('../index.js');

var client = {
  user: 'karthikeyan_b',
  database: 'gti_dw',
  password: 'KarthikeyanB2021',
  port: '5439',
  host: 'gti-dw-dev.cskoof8zzowd.us-east-1.redshift.amazonaws.com'
};

var redshift = new Redshift(client,{rawConnection:true}); //no need to call connect(), without rawConnection, it automatically connects


module.exports.GetList = function(req,res) {
// using callbacks
  try {
    redshift.connect();
    console.log("redshift Query");
    redshift.query('SELECT * FROM "form_user_details"', { raw: true }, function (err, data) {
      if (err) {
        console.log(err)
        res.status(400).send(err);
      } else {
        console.log(data);
        res.status(200).send(data);

        // if you wasnt to close client pool, uncomment redshift.close() line
        // but you won't be able to make subsequent calls because connection is terminated
        redshift.close();
      }
    });
  } catch (error) {
    res.status(400).send(error);
  }
}

// using promises
module.exports.GetListwithPromises = function(req,res) {
// using callbacks
  try {

    // var redshift = new Redshift(client);
    
    redshift.connect(function(err){ //create connection manually
      if (err) {
        res.status(401).send(''+ err);
      } else {
        console.log('redshift connected succesfully');
        redshift.query('SELECT * FROM form_user_details', {raw: true}).then(function(data){ //query redshift
          console.log(data);
          res.status(200).send(data);

          redshift.close();
        }, function(err){
          res.status(400).send(err);
        });
      }
    });
  } catch (error) {
    res.status(401).send('Error - ' + error);
  }
}

module.exports.GetListwithRawQuery = function(req,res) {
// using callbacks
  try {

    // var redshift = new Redshift(client);
    
    redshift.rawQuery(`SELECT * FROM "form_user_details"`, {raw: true}).then(function(data){
      console.log(data); 
    })
    .catch(function(err){
      console.log(err);
    });
  } catch (error) {
    res.status(401).send('Error - ' + error);
  }
}

// const query = `select * from webapp.partner where is_active = true`;
module.exports.executeQuery = async function(req,res) {
  try {
      var query = await redshift.createQuery(req.query);
      console.log(query);
      redshift.connectRedShift(async function (dbConnection) {
        const date1 = new Date().getTime();
        const connection = await dbConnection;
        const result = await connection.query(query);

        const date2 = new Date().getTime();
        const durationMs = date2 - date1;
        const durationSeconds = Math.round(durationMs / 1000);
        let dataLength = 0;

        if (result && result.length) dataLength = result.length;

        console.log(
        `[Redshift] [${durationMs}ms] [${durationSeconds}s] [${dataLength.toLocaleString()} records] ${query}`
        );

        return res.status(200).send({ "query": query, "result": result });
      })
    } catch (e) {
        console.error(`Error executing query: ${query} Error: ${e.message}`);
        res.status(401).send(e);
    }
  }