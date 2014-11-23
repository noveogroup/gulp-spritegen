var gulp = require('gulp');
var ss = require('../index.js');

gulp.task('default', function () {
  gulp.src('./files/*.png').
    pipe(ss({
      ratio: [1, 2, 3, 4],
      algorithm: 'binary-tree',
      gutter: 2,
      engine: 'less',
    }))
    .pipe(gulp.dest('./dest'));
});