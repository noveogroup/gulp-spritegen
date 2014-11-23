var gulp = require('gulp');
var ss = require('../index.js');

gulp.task('default', function () {
  gulp.src('./files/*.png').
    pipe(ss({
      ratio: [1, 2],
      algorithm: 'binary-tree',
      engines: 'scss'
    }))
    .pipe(gulp.dest('./dest'));
});