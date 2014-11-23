var gulp = require('gulp');
var ss = require('../index.js');

gulp.task('default', function () {
  gulp.src('./files/*.png').
    pipe(ss({
      ratio: [1],
      algorithm: 'binary-tree',
      gutter: 10
    }))
    .pipe(gulp.dest('./dest'));
});