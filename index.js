const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');

module.exports = require('./lib/connection.js');
module.exports = require('./lib/test_one.js');
// module.exports.query = require('./lib/query.js');
// module.exports.model = require('./lib/model.js');
// module.exports.import = require('./lib/model.js').import;

var webapp = require('./examples/connection_pooling');


var app = express();

app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/getList', webapp.executeQuery);

app.listen(4000, function () {
    console.log('Server is running.. on Port https://localhost:4000/');
});