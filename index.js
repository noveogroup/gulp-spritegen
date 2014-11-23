'use strict';

var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var path = require('path');
var layout = require('layout');
var _ = require('lodash');
var ejs = require('ejs');

var imageLib = require('./lib/image');
var layerLib = require('./lib/layer-info');
var autoloader = require('./lib/autoloader');

var extentions = [
  '.png'
];

var PLUGIN_NAME = 'gulp-spritegen';

var templates = autoloader(path.join(__dirname, './lib/templates'));

module.exports = function (config) {
  var defaultConfig = {
    engine: 'json',
    angorithm: 'binary-tree',
    ratio: 1,
    gutter: 0,
    spriteImg: 'sprite',
    spriteMeta: 'sprite'
  };
  var options = _.defaults(config, defaultConfig);
  if (!_.isArray(options.ratio)) {
    options.ratio = [options.ratio];
  }
  options.ratio = options.ratio.sort();
  if (options.ratio[0]!==1) options.ratio.unshift(1);
  var images = [];
  var dir = '';
  var cwd = '';
  var stream = through.obj(
    function (file, enc, cb) {
      if (file.isNull()) return cb();
      if (file.isStream()) {
        this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported'));
        return cb();
      }
      if (-1 == extentions.indexOf(path.extname(file.path))) {
        this.emit('error', new PluginError(PLUGIN_NAME, 'Invalid type of file: ' + file.path));
        return cb();
      }
      cwd = file.cwd;
      dir = file.base;
      var image = imageLib.getImageObject(file);
      if (_.isNull(image)) {
        this.emit('error', new PluginError(PLUGIN_NAME, 'Invalid file format: ' + file.path));
        return cb();
      }
      images.push(imageLib.getImageObject(file));
      cb();
    },
    function (cb) {
      var self = this;
      var parser = layerLib();
      if (!images.length) return cb();
      options.ratio.forEach(function (ratio) {
        var layer = layout(options.algorithm);
        images.forEach(function (image) {
          var layerItem = {
            meta: {
              name: image.name,
              content: image.content,
              ratio: ratio,
              gutter: options.gutter * ratio
            },
            width: (image.size.width + 2 * options.gutter) * ratio,
            height: (image.size.height + 2 * options.gutter) * ratio
          };
          if ((layerItem.width - 2 * layerItem.meta.gutter) > image.content.width ||
              (layerItem.height - 2 * layerItem.meta.gutter) > image.content.height) {
            return;
          }
          layer.addItem(layerItem);
        });
        var layerInfo = layer['export']();
        var outContent = imageLib.generateOutput(layerInfo);
        if (outContent) {
          parser.addLayerInfo(layerInfo, options.spriteImg);
          self.push(new gutil.File({
            cwd: cwd,
            base: dir,
            path: path.join(dir, options.spriteImg + '@' + ratio + 'x.png'),
            contents: outContent
          }));
        }
      });

      if (_.isFunction(options.engine)) {
        var engineRes = options.engine(parser.result);
        if (engineRes) {
          return cb(null, engineRes);
        }
        return cb();
      } else {
        var template;
        if (templates[options.engine]) {
          template = templates[options.engine];
        } else {
          // TODO check file path
          template = options.engine;
        }

        var ext = path.extname(template);
        ejs.renderFile(template, {result: parser.result}, function(err, content){
          if (err) {
            return cb(new PluginError(PLUGIN_NAME, err));
          }
          self.push(new gutil.File({
            cwd: cwd,
            base: dir,
            path: path.join(dir, options.spriteMeta + ext),
            contents: new Buffer(content)
          }));
          cb();
        });
      }
    }
  );
  return stream;
};
