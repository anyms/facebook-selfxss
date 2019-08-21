"use strict";

const gulp        = require("gulp");
const babel       = require("gulp-babel");
const uglify      = require("gulp-uglify");
const rename      = require("gulp-rename");
const sourcemaps  = require('gulp-sourcemaps')


gulp.task("compile", function() {
    return gulp.src(["./main.js"])
        // .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(uglify())
        .pipe(rename("main.min.js"))
        // .pipe(sourcemaps.write())
        .pipe(gulp.dest("dist"));
});


gulp.task("default", gulp.series("compile"));

gulp.task("watch", gulp.series("compile", function() {
    gulp.watch(["./main.js"], gulp.series(["compile"]));
}));