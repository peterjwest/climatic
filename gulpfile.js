var fs = require('fs');
var gulp = require('gulp');
var gulpIstanbul = require('gulp-istanbul');
var gulpSequence = require('gulp-sequence');
var coveralls = require('gulp-coveralls');
var jscs = require('gulp-jscs');
var mocha = require('gulp-mocha');
var path = require('path');
var textReporter = require('istanbul-text-full-reporter');

var reportOptions = { reporters: [textReporter] };

if (process.env.CIRCLE_ARTIFACTS) {
  reportOptions.reporters.unshift('lcov');
  reportOptions.reportOpts = {
    lcov: { dir: path.join(process.env.CIRCLE_ARTIFACTS, 'coverage'), file: 'lcov.info' }
  };
}

var libFiles = ['index.js'];
var testFiles = ['test/**/*.js'];
var otherFiles = ['gulpfile.js'];

gulp.task('standards', function() {
  return gulp.src(libFiles.concat(testFiles).concat(otherFiles)).pipe(jscs());
});

gulp.task('coverage', function(cb) {
  (gulp.src(libFiles)
    .pipe(gulpIstanbul({ includeUntested: true }))
    .pipe(gulpIstanbul.hookRequire())
    .on('finish', function() {
      (gulp.src(testFiles)
        .pipe(mocha())
        .on('error', cb)
        .pipe(gulpIstanbul.writeReports(reportOptions))
        .pipe(gulpIstanbul.enforceThresholds({ thresholds: { global: 1 }}))
        .on('end', cb)
      );
    })
  );
});

gulp.task('upload-coverage', function() {
  if (process.env.CIRCLE_ARTIFACTS) {
    return (gulp.src(path.join(process.env.CIRCLE_ARTIFACTS, 'coverage', 'lcov.info'))
      .pipe(coveralls())
    );
  }
});

gulp.task('test', gulpSequence('standards', 'coverage', 'upload-coverage'));
