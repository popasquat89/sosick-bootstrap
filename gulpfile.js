// Include gulp
var gulp = require('gulp'),

// Include Our Plugins
sass       = require('gulp-sass'),
lr         = require('tiny-lr'),
livereload = require('gulp-livereload'),
// html2Js  = require('gulp-html2js'),
html2Js =   require("gulp-ng-html2js"),
server     = lr(),
minifyHtml = require('gulp-minify-html'),
concat = require('gulp-concat'),
uglify = require('gulp-uglify'),
gulpIf = require('gulp-if'),
clean = require('gulp-clean'),
cssMin = require('gulp-minify-css'),
bower = require('gulp-bower'),
bump = require('gulp-bump'),
git  = require('gulp-git'),
nodemon = require('gulp-nodemon'),
jshint = require('gulp-jshint'),
imagemin = require('gulp-imagemin'),
browserify = require('gulp-browserify'),
es6ify = require('es6ify');
var project = require('./project');
var dist = false;


gulp.task('bump', function(){
  return gulp.src('./package.json')
  .pipe(bump({type:'minor'}))
  .pipe(gulp.dest('./'));
});

gulp.task('bower', function () {
  bower();
});

gulp.task('browserify', function () {
    gulp.src([
      project.path.client + '/app.js',
      '!' + project.path.client + '/templates.js'
      ])
      .pipe(jshint('.jshintrc'))
      .pipe(browserify({
        transform: ['es6ify'],
        debug: !dist
      }))
      .pipe(concat('app.js'))
      .pipe(gulpIf(dist, uglify()))
      .pipe(gulp.dest(project.path.dist + '/js/'))
      .pipe(livereload(server));
});

gulp.task('cssmin', function () {
  return gulp.src([
      project.path.dist + '/css/*.css',
      project.path.dist + '/css/**/*.css',
      project.path.client + '/css/*.css',
      project.path.client + '/css/**/*.css'
    ])
    .pipe(concat('styles.css'))
    .pipe(cssMin())
    .pipe(gulp.dest(project.path.dist + '/css'));
});

gulp.task('depsBuild', function () {

  return gulp.src([
    project.path.bower + '/angular-easyfb/angular-easyfb.js',
    project.path.bower + '/angular-ui-router/release/angular-ui-router.js',
    project.path.bower + '/angulartics/src/angulartics.js',
    project.path.bower + '/angulartics/src/angulartics-ga.js',
    project.path.bower + '/modernizr/modernizr.js',
    project.path.bower + '/es5-shim/es5-shim.js',
    project.path.bower + '/json3/lib/json3.js',
    project.path.bower + '/angular-bootstrap/ui-bootstrap-tpls.js',
    project.path.bower + '/angular-bootstrap/ui-bootstrap.js',
    project.path.client + '/templates.js'
  ])
  .pipe(concat('deps.js'))
  .pipe(gulp.dest(project.path.dist + '/js/'));
});

gulp.task('distClean', function () {
  return gulp.src([project.path.dist, project.path.bower], {read: false})
    .pipe(clean(), {force: true});
});

gulp.task('gitCopy', function () {
  return gulp.src('.gitignore-github')
    .pipe(gulp.dest('.gitignore'), {force: true});
});

gulp.task('herokuCopy', function () {
  return gulp.src('.gitignore-heroku')
    .pipe(gulp.dest('.gitignore'), {force: true});
});

gulp.task('herokupush', function () {
  return gulp.src('./*')
  .pipe(git.commit('Work to repo'))
  .pipe(git.push('heroku', 'master'));
});

gulp.task('html2js', function () {
  return gulp.src([
    project.path.client + '/**/*.tpl.html',
    '!' + project.path.bower + '/**/*.tpl.html'
    ])
    .pipe(html2Js({
      moduleName: project.name + '-templates'
    }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest(project.path.client));
});

gulp.task('htmlmin', function () {
  return gulp.src(project.path.client + '/*.html')
    .pipe(gulpIf(dist, minifyHtml()))
    .pipe(gulp.dest(project.path.dist))
    .pipe(livereload(server));
});

gulp.task('imagemin', function () {
  return gulp.src([
      project.path.client + '/img/**/*.png',
      project.path.client + '/img/**/*.jpeg',
      project.path.client + '/img/**/*.gif',
      project.path.client + '/img/*.png',
      project.path.client + '/img/*.jpeg',
      project.path.client + '/img/*.gif',
      project.path.client + '/img/*.jpg',
      project.path.client + '/img/**/*.jpg'
    ])
    .pipe(imagemin())
    .pipe(gulp.dest(project.path.dist + '/img/'), {force: true});
});

gulp.task('jshintclient', function () {
  return gulp.src([
    project.path.client + '/**/*.js',
    project.path.client + '/*.js',
    '!' + project.path.client + '/templates.js',
    '!' + project.path.bower + '/*.js',
    '!' + project.path.bower + '/**/*.js'
    ])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'));
});

gulp.task('jshintserver', function () {
  return gulp.src([
      project.path.server + '/*.js',
      project.path.server + '/**/*.js'
    ])
    .pipe(jshint('.jshint-server'))
    .pipe(jshint.reporter('default'));
});

gulp.task('miscCopy', function () {
  gulp.src(['/*.ico', '/*.txt'], {base: project.path.client, read: false})
    .pipe(gulp.dest(project.path.dist));

  gulp.src([
      project.path.client + '/img/**/*.svg',
      project.path.client + '/img/*.svg'
    ], {read: false})
    .pipe(gulp.dest(project.path.dist + '/img/'), { force: true });
});

gulp.task('nodemon', function () {
  nodemon({ script: project.path.server, options: '--harmony-generators -e js' })
    .on('restart', ['jshintserver']);
});

gulp.task('distFlag', function () {
  production = true; //mainly to tell uglify() not to run.
});

gulp.task('restart', function () {
  nodemon.emit('restart');
});

// Compile Our Sass
gulp.task('sass', function() {
  return gulp.src([
    project.path.client + '/app.scss',
    // project.path.bower + '/**/*.scss'
  ])
  .pipe(sass({
    includePaths: [project.path.bower],
    sourcemap : true
  }))
  .pipe(concat('styles.css'))
  .pipe(gulp.dest(project.path.dist + '/css/'))
  .pipe(livereload(server));
});

gulp.task('devBuild', [ //Doesnt uglify our code
  'jshintserver',
  'jshintclient',
  'html2js',
  'sass',
  'depsBuild',
  'browserify',
  'imagemin',
  'miscCopy',
  'htmlmin'
]);

gulp.task('build', [ //uglify and minify all that we can
  'distFlag',
  'distClean',
  'miscCopy',
  'jshintserver',
  'jshintclient',
  'imagemin',
  'htmlmin',
  'cssmin',
]);

// Default Task
gulp.task('default', function(){
  gulp.run('sass');
  gulp.run('html2js');
  gulp.run('jshintserver');
  gulp.run('browserify');
  // gulp.run('miscCopy');
  // gulp.run('imagemin');
  // gulp.run('nodemon');
  // Watch For Changes To Our SCSS
  server.listen(35729, function (err) {
    if (err) { return console.log(err); }

    gulp.watch(project.path.client + '/**/*.tpl.html', function () {
      gulp.run('html2js');
    });

    gulp.watch(project.path.client + '/*.html', function () {
      gulp.run('htmlmin');
    });

    gulp.watch([
        project.path.client + '/*.scss',
        project.path.client + '/**/*.scss',
        '!' + project.path.bower + '/**/*.scss',
        '!' + project.path.bower + '/*.scss'
      ], function(){
        gulp.run('sass');
    });

    gulp.watch([
        project.path.client + '/**/*.js',
        project.path.client + '/*.js',
        '!' + project.path.bower + '/**/*.js',
        '!' + project.path.bower + '/*.js'
      ], function () {
        gulp.run('jshintclient');
        gulp.run('browserify');
    });

    gulp.watch([
        project.path.server + '/*.js',
        project.path.server + '/**/*.js',
        '!' + project.path.npm + '/**/*.js'
      ], function () {
        gulp.run('jshintserver');
    });

  });
});

gulp.task('deploy', [
  'herokuCopy',
  'bump',
  'build',
  'repopush',
  'githubcopy'
]);

