var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');
var layout = require('layout');
var _ = require('lodash');

var imageLib = require('./lib/image');
var layerLib = require('./lib/layer-info');

var engines = {};
engines['json'] = require('./lib/engines/json');

module.exports = function (config) {
  var defaultConfig = {
    engine: 'json',
    angorithm: 'binary-tree',
    ratio: 1,
    spriteImg: 'sprite',
    spriteMeta: 'sprite'
  };
  var options = _.defaults(config, defaultConfig);
  if (!_.isArray(options.ratio)) {
    options.ratio = [ratioList];
  }
  var images = [];
  var dir = '';
  var stream = through.obj(
    function (file, enc, cb) {
      if (file.isNull()) return cb();
      dir = file.base;
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
              ratio: ratio
            },
            width: image.size.width * ratio,
            height: image.size.height * ratio
          };
          if (layerItem.width > image.content.width ||
              layerItem.height > image.content.height) {
            return;
          }
          layer.addItem(layerItem);
        });
        var layerInfo = layer['export']();
        parser.addLayerInfo(layerInfo);
        self.push(new gutil.File({
          cwd: dir,
          base: dir,
          path: path.join(dir, options.spriteImg + '-' + ratio + '.png'),
          contents: imageLib.generateOutput(layerInfo)
        }));
      });
      var engineFunc = null;
      if (_.isFunction(options.engine)) {
        engineFunc = options.engine;
      } else if (_.isString(options.engine)) {
        if (engineFunc[options.engine]) {
          engineFunc = engines[options.engine];
        } else {
          // PARSING FILE
        }
      }
      var engineRes = engineFunc.call({}, parser.result);
      self.push(new gutil.File({
        cwd: dir,
        base: dir,
        path: path.join(dir, options.spriteMeta + '.' + engineRes.ext),
        contents: engineRes.content
      }));
      cb();
    }
  );
  return stream;
};
