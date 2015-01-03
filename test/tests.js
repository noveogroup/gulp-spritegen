var sg = require('../index.js');
var gutil = require('gulp-util');
var fs = require('fs');
var path = require('path');
var async = require('async');
var assert = require('assert');

describe('gulp-spritegen', function () {
  describe('in buffer mode', function () {
    var files = [];
    before(function (done) {
      var fileNames = [
        './files/chrome-128x128.png',
        './files/ok-128.png',
        './files/setting-128x128.png'
      ];
      async.each(fileNames,
        function (fileName, cb) {
          var name = path.join(__dirname, fileName);
          fs.readFile(name, function (err, data) {
            if (err) return cb(err);
            files.push(new gutil.File({
              cwd: __dirname,
              base: path.dirname(name),
              path: name,
              contents: data
            }));
            cb();
          });
        },
        function (err) {
          if (err) return done(err);
          done();
        }
      );
    });
    it('should generate valid json map', function (done) {
      var spriteGen = sg({});
      var foundJson = false;
      spriteGen.on('data', function (newFile) {
        if (path.extname(newFile.path) == '.json') {
          var outJSON = JSON.parse(newFile.contents);
          assert(outJSON.chrome);
          assert(outJSON.ok);
          assert(outJSON.setting);
          assert.equal(outJSON.chrome.length, 1);
          assert.equal(outJSON.ok.length, 1);
          assert.equal(outJSON.setting.length, 1);
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
    it('should generate css', function (done) {
      var spriteGen = sg({
        engine: 'css'
      });
      var foundCss = false;
      spriteGen.on('data', function (newFile) {
        if (path.extname(newFile.path) == '.css') {
          foundCss = true;
        }
      });
      spriteGen.on('end', function () {
        if (!foundCss) {
          throw new Error("Output JSON doesn't generated");
        }
        done();
      });
      files.forEach(function (file) {
        spriteGen.write(file);
      });
      spriteGen.end();
    });
    it('should generate less', function (done) {
      var spriteGen = sg({
        engine: 'less'
      });
      var foundLess = false;
      spriteGen.on('data', function (newFile) {
        if (path.extname(newFile.path) == '.less') {
          foundLess = true;
        }
      });
      spriteGen.on('end', function () {
        if (!foundLess) {
          throw new Error("Output JSON doesn't generated");
        }
        done();
      });
      files.forEach(function (file) {
        spriteGen.write(file);
      });
      spriteGen.end();
    });
    it('should generate json with 3 ratios for each image', function (done) {
      var spriteGen = sg({
        ratio: [1, 2, 4]
      });
      var foundJson = false;
      spriteGen.on('data', function (newFile) {
        if (path.extname(newFile.path) == '.json') {
          var outJSON = JSON.parse(newFile.contents);
          assert(outJSON.chrome);
          assert(outJSON.ok);
          assert(outJSON.setting);
          assert.equal(outJSON.chrome.length, 3);
          assert.equal(outJSON.ok.length, 3);
          assert.equal(outJSON.setting.length, 3);
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
