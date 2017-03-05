'use strict';

module.exports = validate;

function validate(modelObj, data) {
  var validKeys = Object.keys(modelObj);
  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      if (validKeys.indexOf(key) === -1) {
        delete data[key];
      }
    }
  }
  return data;
}