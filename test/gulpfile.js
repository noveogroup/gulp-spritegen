var gulp = require('gulp');
var ss = require('../index.js');

gulp.task('default', function () {
  gulp.src('./files/*.png').
    pipe(ss({
      ratio: [2.4, 1.2, 3, 4.1, 1],
      algorithm: 'binary-tree',
      gutter: 10,
      engine: 'scss',
    }))
    .pipe(gulp.dest('./dest'));
});
