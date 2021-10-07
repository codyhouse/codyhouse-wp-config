var gulp = require('gulp');
var sass = require('gulp-sass');
sass.compiler = require('sass-embedded');
var sassGlob = require('gulp-sass-glob');
var browserSync = require('browser-sync');
var postcss      = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var connect  = require('gulp-connect-php');
var themeName = 'codyframe-wp'; // use your WP theme folder name
var purgecss = require('gulp-purgecss');

// js file paths
var utilJsPath = 'node_modules/codyhouse-framework/main/assets/js'; 
var componentsJsPath = 'assets/js/components/*.js'; // component js files
var scriptsJsPath = 'assets/js'; //folder for final scripts.js/scripts.min.js files

// css file paths
var cssFolder = 'assets/css'; // folder for final style.css/style-fallback.css files
var scssFilesPath = 'assets/css/**/*.scss'; // scss files to watch

function reload(done) {
  browserSync.reload({notify: false});
  done();
} 

gulp.task('sass', function() {
  return gulp.src(scssFilesPath)
  .pipe(sassGlob())
  .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
  .pipe(postcss([autoprefixer()]))
  .pipe(gulp.dest(cssFolder))
  .pipe(browserSync.reload({
    stream: true,
    notify: false
  })); 
});

gulp.task('scripts', function() {
  return gulp.src([utilJsPath+'/util.js', componentsJsPath])
  .pipe(concat('scripts.js'))
  .pipe(gulp.dest(scriptsJsPath))
  .pipe(rename('scripts.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest(scriptsJsPath))
  .pipe(browserSync.reload({
    stream: true,
    notify: false
  }));
});

gulp.task('watch', gulp.series(['sass', 'scripts'], function () {
  connect.server({}, function (){
    browserSync({
      proxy: 'localhost:8888/'+themeName,
      notify: false
    });
  });
  gulp.watch('**/*.php', gulp.series(reload));
  gulp.watch('assets/css/**/*.scss', gulp.series(['sass']));
  gulp.watch(componentsJsPath, gulp.series(['scripts']));
}));

/* Gulp purgeCSS task */
gulp.task('purgeCSS', function(){
  gulp.src(cssFolder+'/style.css')
  .pipe(purgecss({
    content: ['**/*.php', scriptsJsPath+'/scripts.min.js'],
    safelist: {
      standard: ['.is-hidden', '.is-visible'],
      deep: [/class$/],
      greedy: []
    },
    defaultExtractor: content => content.match(/[\w-/:%@]+(?<!:)/g) || []
  }))
  .pipe(gulp.dest(cssFolder));
});
