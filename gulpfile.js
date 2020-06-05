const { src, dest, watch, series, parallel } = require('gulp');
// SASS vars
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
// JS vars
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const eslint = require('gulp-eslint');
// HTML vars
const htmlHint = require('gulp-htmlhint');
const htmlMin = require('gulp-htmlmin');
const ngHtml2Js = require('gulp-ng-html2js');
// Image vars
const imagemin = require('gulp-imagemin');
// Live-reload server vars
const browserSync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');
// Other vars
const del = require('del');
const plumber = require('gulp-plumber');
const replace = require('gulp-replace');
const fs = require('fs');

const json = JSON.parse(fs.readFileSync('./package.json'));

let build = 'local';
// Function that is ran when buildAll is called to determine buildEnv
// This matches the buildDirs in package.json
function determineBuild(done) {
  switch (process.env.npm_config_build) {
    case 'staging':
      build = 'staging';
      break;
    case 'live':
      build = 'live';
      break;
    default:
      build = 'local';
      break;
  }
  done();
}

const paths = {
  output: 'build/', // Default output location for code build
  server: {
    port: 8080,
    baseDir: './'
  },
  styles: {
    src: 'src/**/*.scss', // src of stlyes
    minifySrc: 'src/app/sass/nwm-ticketing.scss', // List of scss file(s) which should be processed, linted & minified
    output: 'build/css/' // output location of minified styles
  },
  scripts: {
    src: './src/**/*.js', // Src of JS files
    // List of JS folders to concatenate, lint and minified to one file (DON'T LINT ASSETS AS IT WILL TAKE TOO LONG TO SCAN MINIFIED LIBS)
    minifySrc: [
      { src: 'src/app/**/*.js', minName: 'app.min.js', lint: true },
      { src: 'src/assets/**/*.js', minName: 'assets.min.js', lint: false }
    ],
    output: 'build/js/' // Output location of minified JS files
  },
  templates: {
    src: './src/app/**/views/*.html',
    minName: 'partials.min.js'
  },
  images: {
    src: './src/assets/img/**/*',
    dest: 'build/img/'
  }
};

const getRoot = path => '../'.repeat(path.match(/\//gi).length); // Function which takes in a path and back counts slashes to get to baseRoot dir

// Clean the current build & _sourcemaps dir
function cleanBuild() {
  return del([paths.output, '_sourcemaps']);
}

// Process, lint, and minify Sass files
function buildStyles() {
  console.log(json.buildDirs[build].images);

  return src(paths.styles.minifySrc)
    .pipe(
      plumber({
        errorHandler: function(error) {
          console.log(error.message);
          this.emit('end');
        }
      })
    )
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError)) // Compile Sass
    .pipe(autoprefixer({ browsers: ['last 5 versions', '> 1% in GB'] })) // Prefix css with older browser support
    .pipe(cleanCSS({ level: 2 })) // Minify css
    .pipe(sourcemaps.write(getRoot(paths.styles.output) + '_sourcemaps/'))
    .pipe(dest(paths.styles.output))
    .pipe(replace('$*imgUrl', json.buildDirs[build].imgUrl))
    .pipe(dest(paths.styles.output))
    .pipe(browserSync.stream()); // Push new CSS to server without reload
}

// Minify, and concatenate scripts
function buildScripts(done) {
  paths.scripts.minifySrc.map(jsFile => minifyJS(jsFile));
  done();
}

// Placeholder function for buildScripts to loop through
function minifyJS(jsFile) {
  return src(jsFile.src)
    .pipe(
      plumber({
        errorHandler: function(error) {
          console.log(error.message);
          this.emit('end');
        }
      })
    )
    .pipe(sourcemaps.init())
    .pipe(concat(jsFile.minName)) // concat all js files in folder
    .pipe(uglify({ mangle: { reserved: ['jQuery'] } })) // Mangle var names etc.
    .pipe(sourcemaps.write(getRoot(paths.scripts.output) + '_sourcemaps/'))
    .pipe(plumber.stop())
    .pipe(dest(paths.scripts.output))
    .pipe(replace('$*api', json.buildDirs[build].api))
    .pipe(replace('$*baseUrl', json.buildDirs[build].baseUrl))
    .pipe(dest(paths.scripts.output)); // Spit out concat + minified file in ./build/
}

// Lint scripts/JS
function lintScripts() {
  // Loop through each minifySrc and check if it is to be linted
  const lintSrc = paths.scripts.minifySrc.map(jsFile =>
    jsFile.lint ? jsFile.src : '!' + jsFile.src
  );

  return src(lintSrc)
    .pipe(eslint({ configFile: '.eslintrc.json' })) // eslint() attaches the lint output to the "eslint" property of the file object so it can be used by other modules.
    .pipe(eslint.format()); // eslint.format() outputs the lint results to the console.
  // .pipe(eslint.failAfterError()); // Cause the stream to stop/fail before copying an invalid JS file to the output directory
}
// Lint Templates/HTML
function lintTemplates() {
  return src(paths.templates.src)
    .pipe(htmlHint('.htmlhintrc'))
    .pipe(htmlHint.reporter());
}

function buildTemplates() {
  return src(paths.templates.src)
    .pipe(htmlMin({ collapseWhitespace: true, removeComments: true }))
    .pipe(
      ngHtml2Js({
        moduleName: 'ticketingApp'
      })
    )
    .pipe(concat(paths.templates.minName))
    .pipe(uglify())
    .pipe(dest('./build/js/'))
    .pipe(replace('$*baseUrl', json.buildDirs[build].baseUrl))
    .pipe(replace('$*imgUrl', json.buildDirs[build].imgUrl))
    .pipe(dest('./build/js/'));
}

// Optimise images
function minImages() {
  return src(paths.images.src)
    .pipe(imagemin())
    .pipe(dest(paths.images.dest));
}

// Server
function server(done) {
  browserSync.init({
    server: {
      baseDir: paths.server.baseDir
    },
    port: paths.server.port
  });
  done();
}

function reload(done) {
  browserSync.reload();
  done();
}
const buildAll = series(
  determineBuild,
  cleanBuild,
  minImages,
  buildScripts,
  buildStyles,
  buildTemplates,
  lintScripts,
  lintTemplates
);
// Watch files for changes
function watchFiles() {
  // Lint, concat, minify JS then reload server
  watch([paths.scripts.src], series(lintScripts, buildScripts, reload));
  watch('./**/*.html', series(lintTemplates, buildTemplates, reload)); // Reload when html changes
  watch(paths.images.src, minImages);
  watch(paths.styles.src, buildStyles); // run buildStyles function on scss change(s)
  watch(['./package.json', './gulpfile.js'], series(buildAll, reload));
}
const dev = series(
  lintScripts,
  lintTemplates,
  parallel(buildStyles, buildScripts, buildTemplates, minImages),
  parallel(watchFiles, server)
); // run buildStyles & minifyJS on start, series so () => run in an order and parallel so () => can run at same time
// Export items to be used in terminal
exports.default = dev;
exports.lintScripts = lintScripts;
exports.lintTemplates = lintTemplates;
exports.clean = cleanBuild;
exports.buildScripts = series(buildScripts, lintScripts);
exports.buildStyles = buildStyles;
exports.buildTemplates = series(buildTemplates, lintTemplates);
exports.minImages = minImages;
exports.buildAll = buildAll;
