// adapated from https://github.com/tj/node-migrate/blob/master/bin/migrate
// this was originally CLI, but I want to make this API accessible programatically

var migrate = require('migrate');
var join = require('path').join;
var fs = require('fs');
var folderName = 'redshift_migrations';

var template = [
    '\'use strict\''
  , ''
  , 'exports.up = function(next) {'
  , '  next();'
  , '};'
  , ''
  , 'exports.down = function(next) {'
  , '  next();'
  , '};'
  , ''
].join('\n');



function create(name) {
  try {
    fs.mkdirSync(folderName, 0774);
  } catch (err) {
    // ignore
  }
  var curr = Date.now();
  name = curr + '-' + name;
  var path = join(folderName, name + '.js');
  console.log('create', join(process.cwd(), path));
  fs.writeFileSync(path, template);
}

module.exports.create = create;

function up(migrationName) {
  performMigration('up', migrationName);
}

module.exports.up = up;
/**
 * down [name]
 */

function down(migrationName) {
  performMigration('down', migrationName);
}

module.exports.down = down;

function performMigration(direction, migrationName) {
  var state = join(folderName, '.migrate');
  var set = migrate.load(state, folderName);

  set.on('migration', function (migration, direction) {
    console.log(direction, migration.title);
  });

  // `migrationName` might be a number of migrations to jump up or down, so we
  // have to convert it to a migration name the underlying `node-migrate` can
  // handle

  if (Number.isInteger(Number(migrationName))) {
    var numMigrations = Number(migrationName)

    if (direction === 'down') {
      numMigrations = -numMigrations
    }

    var stateObj = JSON.parse(fs.readFileSync(state, 'utf8'))
    migrationName = set.migrations[stateObj.pos + numMigrations].title
  }

  var migrationPath = migrationName ?
    join(folderName, migrationName) :
    migrationName;

  set[direction](migrationName, function (err) {
    if (err) {
      console.log('error', err);
      process.exit(1);
    }

    console.log('migration', 'complete');
    process.exit(0);
  });
}
