module.exports = function () {
  var parser = {
    result: {},
    addLayerInfo: function (info) {
      info.items.forEach(function (item) {
        if (!this.result[item.meta.name]) {
          this.result[item.meta.name] = {};
        }
        this.result[item.meta.name][item.meta.ratio] = {
          x: item.x,
          y: item.y,
          height: item.height,
          width: item.width,
          ratio: item.meta.ratio
        };
      }.bind(this));
    }
  };
  return parser;
};