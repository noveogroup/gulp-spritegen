var fs = require('fs');
var path = require('path');

module.exports = function (dir) {
  var result = {};
  var templates = fs.readdirSync(dir);
  templates.forEach(function (template) {
    var ext = path.extname(template);
    result[ext.substr(1)] = path.join(dir, template);
  });
  return result;
};