var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var path = require('path');
var layout = require('layout');
var _ = require('lodash');
var ejs = require('ejs');

var imageLib = require('./lib/image');
var layerLib = require('./lib/layer-info');

var extentions = [
  '.png'
];

var PLUGIN_NAME = 'gulp-spritegen';

var templates = {
  json: path.join(__dirname, './lib/templates/template.json')
};

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
    options.ratio = [ratioList];
  }
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
          if (layerItem.width > image.content.width ||
              layerItem.height > image.content.height) {
            return;
          }
          layer.addItem(layerItem);
        });
        var layerInfo = layer['export']();
        parser.addLayerInfo(layerInfo, options.spriteImg);
        self.push(new gutil.File({
          cwd: cwd,
          base: dir,
          path: path.join(dir, options.spriteImg + '-' + ratio + '.png'),
          contents: imageLib.generateOutput(layerInfo)
        }));
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

        ext = path.extname(template);
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
