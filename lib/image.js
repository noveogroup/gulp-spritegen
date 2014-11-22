var Canvas = require('canvas');
var Image = Canvas.Image;
var async = require('async');
var path = require('path');
var _ = require('lodash');
var imageDim = require('parse-image-dimensions');

exports.getImageObject = function (file) {
  var filename = path.basename(file.path, path.extname(file.path));
  var infoFromFilename = imageDim(filename);
  if (_.isNull(infoFromFilename)) {
    // TODO: Throws some error
  }
  var content = new Image();
  content.src = file.contents;
  var size = {
    width: infoFromFilename.width,
    height: infoFromFilename.height
  };
  if (_.isNull(size.width)) {
    size.width = (content.width / (content.height / size.height)) | 0;
  }
  if (_.isNull(size.height)) {
    size.height = (content.height / (content.width / size.width)) | 0;
  }
  var name = path.relative(file.base, path.dirname(file.path));
  name = name.split(path.sep);
  name.push(infoFromFilename.name);
  while (true) {
    if ('.' == name[0] || '..' == name[0] || !name[0]) {
      name.shift();
    } else {
      break;
    }
  }
  return {
    name: name.join('-'),
    file: file,
    content: content,
    size: size
  };
};

exports.generateOutput = function (layerInfo) {
  var outCanvas = new Canvas(layerInfo.width, layerInfo.height);
  var context = outCanvas.getContext('2d');
  layerInfo.items.forEach( function (item) {
    var sizedW = item.meta.content.width / item.width;
    var sizedH = item.meta.content.height / item.height;
    if (sizedW == sizedH) {
      context.drawImage(item.meta.content, item.x, item.y, item.width, item.height);
    } else {
      var sizedMin = Math.min(sizedW, sizedH);
      var width = (item.meta.content.width / sizedW) * sizedMin;
      var height = (item.meta.content.height / sizedH) * sizedMin;
      var x = - (width - item.meta.content.width) / 2;
      var y = - (height - item.meta.content.height) / 2;
      context.drawImage(item.meta.content, x, y, width, height, item.x, item.y, item.width, item.height);
    }
  });
  return outCanvas.toBuffer();
};