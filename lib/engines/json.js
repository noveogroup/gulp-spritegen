module.exports = function (options) {
  return {
    ext: 'json',
    content: new Buffer(JSON.stringify(options))
  };
};