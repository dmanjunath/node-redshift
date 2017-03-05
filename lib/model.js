var join = require('path').join;
var fs = require('fs');
var folderName = 'redshift_models';
var ORM = require('./orm.js');
var Redshift = require('./connection.js');


var template = [
  "'use strict';"
  , "var model = require('node-redshift').model;"
  , "var person = {"
  , "  'tableName': 'people',"
  , "  'tableProperties': {"
  , "    'id': {"
  , "      'type': 'key'"
  , "    },"
  , "    'name': { "
  , "      'type': 'string',"
  , "      'required': true"
  , "    },"
  , "    'email': { "
  , "      'type': 'string',"
  , "      'required': true"
  , "    }"
  , "  }"
  , "};"
  , "module.exports = person;"
].join('\n');

function create(name) {
  try {
    fs.mkdirSync(folderName, 0774);
  } catch (err) {
    // ignore
  }
  var path = join(folderName, name + '.js');
  fs.writeFileSync(path, template);
}

module.exports.create = create;

Redshift.prototype.import = function (name) {
  if (!Redshift.prototype.models) Redshift.prototype.models = []; {
    var path = join(process.cwd(), name);
  }
  if (Redshift.prototype.models[path]) {
    return Redshift.prototype.models[path];
  } else {
    var obj = require(path);

    if (typeof obj != 'object') {
      throw new Error('Cannot build without an object');
    }
    if (obj.hasOwnProperty('tableName') == false && obj.tableName != null) {
      throw new Error('Cannot build without a tableName to connect');
    }
    if (obj.hasOwnProperty('tableProperties') == false && obj.tableProperties != null) {
      throw new Error('Cannot build without tableProperties to export');
    }

    var _return = new ORM(this);
    _return.tableName = obj.tableName;
    _return.tableProperties = obj.tableProperties;

    Redshift.prototype.models[path] = _return;
    return _return;
  }
};

module.exports.import = Redshift.prototype.import;