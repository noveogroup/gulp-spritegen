'use strict';

module.exports = function () {
  var parser = {
    result: {},
    addLayerInfo: function (info, filename) {
      info.items.forEach(function (item) {
        if (!this.result[item.meta.name]) {
          this.result[item.meta.name] = {};
        }
        this.result[item.meta.name][item.meta.ratio] = {
          x: item.x + item.meta.gutter,
          y: item.y + item.meta.gutter,
          height: item.height - 2 * item.meta.gutter,
          width: item.width - 2 * item.meta.gutter,
          ratio: item.meta.ratio,
          filename: filename,
          sprite: {
            width: info.width,
            height: info.height
          }
        };
      }.bind(this));
    }
  };
  return parser;
};
