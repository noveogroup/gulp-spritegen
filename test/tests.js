var sg = require('../index.js');
var gutil = require('gulp-util');
var fs = require('fs');
var path = require('path');
var assert = require('assert');

describe('gulp-spritegen', function () {
  describe('in buffer mode', function () {
    // Reading files.
    var fileNames = [
      './files/chrome-128x128.png',
      './files/ok-128.png',
      './files/setting-128x128.png'
    ];
    var files = [];
    fileNames.forEach(function (name) {
      name = path.join(__dirname, name);
      files.push(new gutil.File({
        cwd: __dirname,
        base: path.dirname(name),
        path: name,
        contents: fs.readFileSync(name)
      }));
    });
    it('should generate valid json map', function (done) {
      var spriteGen = sg({});
      var foundJson = false;
      spriteGen.on('data', function (newFile) {
        /*jshint -W069 */
        if (path.extname(newFile.path) == '.json') {
          var outJSON = JSON.parse(newFile.contents);
          assert(outJSON['chrome']);
          assert(outJSON['ok']);
          assert(outJSON['setting']);
          assert.equal(outJSON['chrome'].length, 1);
          assert.equal(outJSON['ok'].length, 1);
          assert.equal(outJSON['setting'].length, 1);
          foundJson = true;
        }
      });
      spriteGen.on('end', function () {
        if (!foundJson) {
          throw new Error("Output JSON doesn't generated");
        }
        done();
      });
      files.forEach(function (file) {
        spriteGen.write(file);
      });
      spriteGen.end();
    });
  });
});
