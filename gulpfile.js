const { src, dest, watch, series, parallel } = require('gulp');
// SASS vars
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
// JS vars
const terser = require('gulp-terser');
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

var gulpCopy = require('gulp-copy');

const json = JSON.parse(fs.readFileSync('./package.json'));

let build = 'azure';
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
    case 'livetest':
      build = 'livetest';
      break;
    case 'azure':
      build = 'azure';
      break;
    case 'azurelive':
      build = 'azurelive';
      break;
    default:
      build = 'azure';
      break;
  }
  done();
}

const paths = {
  output: 'build/', // Default output location for code build
  server: {
    port: 8080,
    baseDir: './',
    index: 'build/index.html'
  },
  serverSwift: {
    port: 8080,
    baseDir: './',
    index: 'build/index-swift.html'
  },
  serverOneapp: {
    port: 8080,
    baseDir: './',
    index: 'build/index-oneapp.html'
  },
  styles: {
    src: 'src/app/sass/wmn/*.scss', // src of styles
    minifySrc: 'src/app/sass/wmn/wmn-ticketing.scss', // List of scss file(s) which should be processed, linted & minified
    output: 'build/css/wmn' // output location of minified styles
  },
  stylesSwift: {
    src: 'src/app/sass/swift/*.scss', // src of styles
    minifySrc: 'src/app/sass/swift/swift-ticketing.scss', // List of scss file(s) which should be processed, linted & minified
    output: 'build/css/swift' // output location of minified styles
  },
  ticketStyles: {
    src: 'src/app/ticket/*.scss'
  },
  ticketsStyles: {
    src: 'src/app/tickets/*.scss'
  },
  scripts: {
    src: './src/**/*.js', // Src of JS files
    // List of JS folders to concatenate, lint and minified to one file (DON'T LINT ASSETS AS IT WILL TAKE TOO LONG TO SCAN MINIFIED LIBS)
    minifySrc: [
      { src: 'src/app/js/wmn/*.js', minName: 'wmn.app.min.js', lint: true },
      { src: 'src/app/js/swift/*.js', minName: 'swift.app.min.js', lint: true },
      {
        src: 'src/app/js/oneapp/*.js',
        minName: 'oneapp.app.min.js',
        lint: true
      },
      { src: 'src/app/js/app/*.js', minName: 'app.app.min.js', lint: true },
      { src: 'src/app/js/app-test/*.js', minName: 'app-test.app.min.js', lint: true },
      { src: 'src/assets/**/*.js', minName: 'assets.min.js', lint: false },
      { src: 'src/app/services/*.js', minName: 'services.min.js', lint: true },
      { src: 'src/app/shared/*.js', minName: 'shared.min.js', lint: true },
      {
        src: 'src/app/controller/*.js',
        minName: 'controller.min.js',
        lint: true
      },
      {
        src: 'src/app/directives/*.js',
        minName: 'directives.min.js',
        lint: true
      }
    ],
    output: 'build/js/' // Output location of minified JS files
  },
  scriptsTfwm: {
    src: './src/**/*.js', // Src of JS files
    // List of JS folders to concatenate, lint and minified to one file (DON'T LINT ASSETS AS IT WILL TAKE TOO LONG TO SCAN MINIFIED LIBS)
    minifySrc: [
      { src: 'src/app/js/wmn/*.js', minName: 'tfwm.app.min.js', lint: true },
      { src: 'src/assets/**/*.js', minName: 'tfwm.assets.min.js', lint: false },
      { src: 'src/app/services/*.js', minName: 'tfwm.services.min.js', lint: true },
      { src: 'src/app/shared/*.js', minName: 'tfwm.shared.min.js', lint: true },
      {
        src: 'src/app/controller/*.js',
        minName: 'tfwm.controller.min.js',
        lint: true
      },
      {
        src: 'src/app/directives/*.js',
        minName: 'tfwm.directives.min.js',
        lint: true
      }
    ],
    output: 'build/tfwm/js/'
  },
  scriptsOneapp: {
    src: './src/**/*.js', // Src of JS files
    // List of JS folders to concatenate, lint and minified to one file (DON'T LINT ASSETS AS IT WILL TAKE TOO LONG TO SCAN MINIFIED LIBS)
    minifySrc: [
      { src: 'src/app/js/oneapp/*.js', minName: 'oneapp.app.min.js', lint: true },
      { src: 'src/assets/**/*.js', minName: 'oneapp.assets.min.js', lint: false },
      { src: 'src/app/services/*.js', minName: 'oneapp.services.min.js', lint: true },
      { src: 'src/app/shared/*.js', minName: 'oneapp.shared.min.js', lint: true },
      {
        src: 'src/app/controller/*.js',
        minName: 'oneapp.controller.min.js',
        lint: true
      },
      {
        src: 'src/app/directives/*.js',
        minName: 'oneapp.directives.min.js',
        lint: true
      }
    ],
    output: 'build/oneapp/js/'
  },
  scriptsApp: {
    src: './src/**/*.js', // Src of JS files
    // List of JS folders to concatenate, lint and minified to one file (DON'T LINT ASSETS AS IT WILL TAKE TOO LONG TO SCAN MINIFIED LIBS)
    minifySrc: [
      { src: 'src/app/js/app/*.js', minName: 'app.app.min.js', lint: true },
      { src: 'src/assets/**/*.js', minName: 'app.assets.min.js', lint: false },
      { src: 'src/app/services/*.js', minName: 'app.services.min.js', lint: true },
      { src: 'src/app/shared/*.js', minName: 'app.shared.min.js', lint: true },
      {
        src: 'src/app/controller/*.js',
        minName: 'app.controller.min.js',
        lint: true
      },
      {
        src: 'src/app/directives/*.js',
        minName: 'app.directives.min.js',
        lint: true
      }
    ],
    output: 'build/app/js/'
  },
  scriptsAppTest: {
    src: './src/**/*.js', // Src of JS files
    // List of JS folders to concatenate, lint and minified to one file (DON'T LINT ASSETS AS IT WILL TAKE TOO LONG TO SCAN MINIFIED LIBS)
    minifySrc: [
      { src: 'src/app/js/app/*.js', minName: 'app-test.app.min.js', lint: true },
      { src: 'src/assets/**/*.js', minName: 'app-test.assets.min.js', lint: false },
      { src: 'src/app/services/*.js', minName: 'app-test.services.min.js', lint: true },
      { src: 'src/app/shared/*.js', minName: 'app-test.shared.min.js', lint: true },
      {
        src: 'src/app/controller/*.js',
        minName: 'app-test.controller.min.js',
        lint: true
      },
      {
        src: 'src/app/directives/*.js',
        minName: 'app-test.directives.min.js',
        lint: true
      }
    ],
    output: 'build/app-test/js/'
  },
  templates: {
    src: './src/app/**/views/wmn/*.html',
    minName: 'tfwm.partials.min.js'
  },
  templatesApp: {
    src: './src/app/**/views/app/*.html',
    minName: 'app.partials.min.js'
  },
  templatesAppTest: {
    src: './src/app/**/views/app/*.html',
    minName: 'app-test.partials.min.js'
  },
  templatesShared: {
    src: './src/app/**/views/shared/*.html',
    minName: 'tfwm.shared.partials.min.js'
  },
  templatesSwiftShared: {
    src: './src/app/**/views/shared/*.html',
    minName: 'swift.shared.partials.min.js'
  },
  templatesOneappShared: {
    src: './src/app/**/views/shared/*.html',
    minName: 'oneapp.shared.partials.min.js'
  },
  templatesAppShared: {
    src: './src/app/**/views/shared/*.html',
    minName: 'app.shared.partials.min.js'
  },
  templatesAppTestShared: {
    src: './src/app/**/views/shared/*.html',
    minName: 'app-test.shared.partials.min.js'
  },
  templatesSwift: {
    src: './src/app/**/views/swift/*.html',
    minName: 'swift.partials.min.js'
  },
  templatesOneapp: {
    src: './src/app/**/views/app/*.html',
    minName: 'oneapp.partials.min.js'
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
    .pipe(autoprefixer()) // Prefix css with older browser support
    .pipe(cleanCSS({ level: 2 })) // Minify css
    .pipe(sourcemaps.write(getRoot(paths.styles.output) + '_sourcemaps/'))
    .pipe(replace('$*imgUrl', json.buildDirs[build].imgUrl))
    .pipe(dest(paths.styles.output))
    .pipe(browserSync.stream()); // Push new CSS to server without reload
}

// Process, lint, and minify Sass files for Swift
function buildSwiftStyles() {
  console.log(json.buildDirs[build].images);

  return src(paths.stylesSwift.minifySrc)
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
    .pipe(autoprefixer()) // Prefix css with older browser support
    .pipe(cleanCSS({ level: 2 })) // Minify css
    .pipe(sourcemaps.write(getRoot(paths.stylesSwift.output) + '_sourcemaps/'))
    .pipe(replace('$*imgUrl', json.buildDirs[build].imgUrl))
    .pipe(dest(paths.stylesSwift.output))
    .pipe(browserSync.stream()); // Push new CSS to server without reload
}

// Minify, and concatenate scripts
function buildScripts(done) {
  paths.scripts.minifySrc.map(jsFile => minifyJS(jsFile));
  done();
}

function buildTfwmScripts(done) {
  paths.scriptsTfwm.minifySrc.map(jsFile => minifyJS(jsFile));
  done();
}

function buildOneappScripts(done) {
  paths.scriptsOneapp.minifySrc.map(jsFile => minifyJS(jsFile));
  done();
}

function buildAppScripts(done) {
  paths.scriptsApp.minifySrc.map(jsFile => minifyJS(jsFile));
  done();
}

function buildAppTestScripts(done) {
  paths.scriptsAppTest.minifySrc.map(jsFile => minifyJS(jsFile));
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
    .pipe(terser())
    .pipe(sourcemaps.write(getRoot(paths.scripts.output) + '_sourcemaps/'))
    .pipe(plumber.stop())
    .pipe(replace('$*api', json.buildDirs[build].api))
    .pipe(replace('$*baseUrl', json.buildDirs[build].baseUrl))
    .pipe(replace('$*baseUrlSwift', json.buildDirs[build].baseUrlSwift))
    .pipe(replace('$*baseUrlOneapp', json.buildDirs[build].baseUrlOneapp))
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
    .pipe(terser())
    .pipe(replace('$*baseUrl', json.buildDirs[build].baseUrl))
    .pipe(replace('$*baseUrlSwift', json.buildDirs[build].baseUrlSwift))
    .pipe(replace('$*baseUrlOneapp', json.buildDirs[build].baseUrlOneapp))
    .pipe(replace('$*imgUrl', json.buildDirs[build].imgUrl))
    .pipe(replace('$*paygLink', json.buildDirs[build].paygLink))
    .pipe(dest('./build/js/'));
}

function buildAppTemplates() {
  return src(paths.templatesApp.src)
    .pipe(htmlMin({ collapseWhitespace: true, removeComments: true }))
    .pipe(
      ngHtml2Js({
        moduleName: 'ticketingApp'
      })
    )
    .pipe(concat(paths.templatesApp.minName))
    .pipe(terser())
    .pipe(replace('$*baseUrl', json.buildDirs[build].baseUrl))
    .pipe(replace('$*baseUrlSwift', json.buildDirs[build].baseUrlSwift))
    .pipe(replace('$*baseUrlOneapp', json.buildDirs[build].baseUrlOneapp))
    .pipe(replace('$*imgUrl', json.buildDirs[build].imgUrl))
    .pipe(replace('$*paygLink', json.buildDirs[build].paygLink))
    .pipe(dest('./build/js/'));
}

function buildAppTestTemplates() {
  return src(paths.templatesAppTest.src)
    .pipe(htmlMin({ collapseWhitespace: true, removeComments: true }))
    .pipe(
      ngHtml2Js({
        moduleName: 'ticketingApp'
      })
    )
    .pipe(concat(paths.templatesAppTest.minName))
    .pipe(terser())
    .pipe(replace('$*baseUrl', json.buildDirs[build].baseUrl))
    .pipe(replace('$*baseUrlSwift', json.buildDirs[build].baseUrlSwift))
    .pipe(replace('$*baseUrlOneapp', json.buildDirs[build].baseUrlOneapp))
    .pipe(replace('$*imgUrl', json.buildDirs[build].imgUrl))
    .pipe(replace('$*paygLink', json.buildDirs[build].paygLink))
    .pipe(dest('./build/js/'));
}

// Lint Shared Templates/HTML
function lintSharedTemplates() {
  return src(paths.templatesShared.src)
    .pipe(htmlHint('.htmlhintrc'))
    .pipe(htmlHint.reporter());
}

function lintSharedSwiftTemplates() {
  return src(paths.templatesSwiftShared.src)
    .pipe(htmlHint('.htmlhintrc'))
    .pipe(htmlHint.reporter());
}

function lintSharedOneappTemplates() {
  return src(paths.templatesOneappShared.src)
    .pipe(htmlHint('.htmlhintrc'))
    .pipe(htmlHint.reporter());
}

function lintSharedAppTemplates() {
  return src(paths.templatesAppShared.src)
    .pipe(htmlHint('.htmlhintrc'))
    .pipe(htmlHint.reporter());
}

function lintSharedAppTestTemplates() {
  return src(paths.templatesAppTestShared.src)
    .pipe(htmlHint('.htmlhintrc'))
    .pipe(htmlHint.reporter());
}

function buildSharedTemplates() {
  return src(paths.templatesShared.src)
    .pipe(htmlMin({ collapseWhitespace: true, removeComments: true }))
    .pipe(
      ngHtml2Js({
        moduleName: 'ticketingApp'
      })
    )
    .pipe(concat(paths.templatesShared.minName))
    .pipe(terser())
    .pipe(replace('$*baseUrl', json.buildDirs[build].baseUrl))
    .pipe(replace('$*baseUrlSwift', json.buildDirs[build].baseUrlSwift))
    .pipe(replace('$*swiftHost', json.buildDirs[build].swiftHost))
    .pipe(replace('$*baseUrlOneapp', json.buildDirs[build].baseUrlOneapp))
    .pipe(replace('$*oneappHost', json.buildDirs[build].oneappHost))
    .pipe(replace('$*imgUrl', json.buildDirs[build].imgUrl))
    .pipe(replace('$*paygLink', json.buildDirs[build].paygLink))
    .pipe(dest('./build/js/'));
}

function buildSharedSwiftTemplates() {
  return src(paths.templatesSwiftShared.src)
    .pipe(htmlMin({ collapseWhitespace: true, removeComments: true }))
    .pipe(
      ngHtml2Js({
        moduleName: 'ticketingApp'
      })
    )
    .pipe(concat(paths.templatesSwiftShared.minName))
    .pipe(terser())
    .pipe(replace('$*baseUrl', json.buildDirs[build].baseUrlSwift))
    .pipe(replace('$*baseUrlSwift', json.buildDirs[build].baseUrlSwift))
    .pipe(replace('$*swiftHost', json.buildDirs[build].swiftHost))
    .pipe(replace('$*imgUrl', json.buildDirs[build].imgUrl))
    .pipe(replace('$*paygLink', json.buildDirs[build].paygLink))
    .pipe(dest('./build/js/'));
}

function buildSharedOneappTemplates() {
  return src(paths.templatesOneappShared.src)
    .pipe(htmlMin({ collapseWhitespace: true, removeComments: true }))
    .pipe(
      ngHtml2Js({
        moduleName: 'ticketingApp'
      })
    )
    .pipe(concat(paths.templatesOneappShared.minName))
    .pipe(terser())
    .pipe(replace('$*baseUrl', json.buildDirs[build].baseUrlOneapp))
    .pipe(replace('$*baseUrlOneapp', json.buildDirs[build].baseUrlOneapp))
    .pipe(replace('$*oneappHost', json.buildDirs[build].oneappHost))
    .pipe(replace('$*imgUrl', json.buildDirs[build].imgUrl))
    .pipe(replace('$*paygLink', json.buildDirs[build].paygLink))
    .pipe(dest('./build/js/'));
}

function buildSharedAppTemplates() {
  return src(paths.templatesAppShared.src)
    .pipe(htmlMin({ collapseWhitespace: true, removeComments: true }))
    .pipe(
      ngHtml2Js({
        moduleName: 'ticketingApp'
      })
    )
    .pipe(concat(paths.templatesAppShared.minName))
    .pipe(terser())
    .pipe(replace('$*baseUrl', json.buildDirs[build].baseUrlOneapp))
    .pipe(replace('$*baseUrlOneapp', json.buildDirs[build].baseUrlOneapp))
    .pipe(replace('$*oneappHost', json.buildDirs[build].oneappHost))
    .pipe(replace('$*imgUrl', json.buildDirs[build].imgUrl))
    .pipe(replace('$*paygLink', json.buildDirs[build].paygLink))
    .pipe(dest('./build/js/'));
}

function buildSharedAppTestTemplates() {
  return src(paths.templatesAppTestShared.src)
    .pipe(htmlMin({ collapseWhitespace: true, removeComments: true }))
    .pipe(
      ngHtml2Js({
        moduleName: 'ticketingApp'
      })
    )
    .pipe(concat(paths.templatesAppTestShared.minName))
    .pipe(terser())
    .pipe(replace('$*baseUrl', json.buildDirs[build].baseUrlOneapp))
    .pipe(replace('$*baseUrlOneapp', json.buildDirs[build].baseUrlOneapp))
    .pipe(replace('$*oneappHost', json.buildDirs[build].oneappHost))
    .pipe(replace('$*imgUrl', json.buildDirs[build].imgUrl))
    .pipe(replace('$*paygLink', json.buildDirs[build].paygLink))
    .pipe(dest('./build/js/'));
}

// Lint Swift Templates/HTML
function lintSwiftTemplates() {
  return src(paths.templatesShared.src)
    .pipe(htmlHint('.htmlhintrc'))
    .pipe(htmlHint.reporter());
}

function buildSwiftTemplates() {
  return src(paths.templatesSwift.src)
    .pipe(htmlMin({ collapseWhitespace: true, removeComments: true }))
    .pipe(
      ngHtml2Js({
        moduleName: 'ticketingApp'
      })
    )
    .pipe(concat(paths.templatesSwift.minName))
    .pipe(terser())
    .pipe(replace('$*baseUrl', json.buildDirs[build].baseUrlSwift))
    .pipe(replace('$*imgUrl', json.buildDirs[build].imgUrl))
    .pipe(replace('$*swiftGo', json.buildDirs[build].swiftGo))
    .pipe(dest('./build/js/'));
}

// Lint Oneapp Templates/HTML
function lintOneappTemplates() {
  return src(paths.templatesOneapp.src)
    .pipe(htmlHint('.htmlhintrc'))
    .pipe(htmlHint.reporter());
}

function buildOneappTemplates() {
  return src(paths.templatesOneapp.src)
    .pipe(htmlMin({ collapseWhitespace: true, removeComments: true }))
    .pipe(
      ngHtml2Js({
        moduleName: 'ticketingApp'
      })
    )
    .pipe(concat(paths.templatesOneapp.minName))
    .pipe(terser())
    .pipe(replace('$*baseUrl', json.buildDirs[build].baseUrlOneapp))
    .pipe(replace('$*imgUrl', json.buildDirs[build].imgUrl))
    .pipe(replace('$*swiftGo', json.buildDirs[build].swiftGo))
    .pipe(dest('./build/js/'));
}

// Lint App Templates/HTML
function lintAppTemplates() {
  return src(paths.templatesApp.src)
    .pipe(htmlHint('.htmlhintrc'))
    .pipe(htmlHint.reporter());
}

// Lint App-test Templates/HTML
function lintAppTestTemplates() {
  return src(paths.templatesAppTest.src)
    .pipe(htmlHint('.htmlhintrc'))
    .pipe(htmlHint.reporter());
}

function moveMain() {
  return src(['index.html']).pipe(gulpCopy('build', { prefix: 1 }));
}

function moveTfWM() {
  return src(['tfwm/index.html']).pipe(gulpCopy('build/tfwm', { prefix: 1 }));
}

function moveSwift() {
  return src(['swift/index.html']).pipe(gulpCopy('build/swift', { prefix: 1 }));
}

function moveOneapp() {
  return src(['oneapp/index.html']).pipe(gulpCopy('build/oneapp', { prefix: 1 }));
}

function moveApp() {
  return src(['app/index.html']).pipe(gulpCopy('build/app', { prefix: 1 }));
}

function moveAppTest() {
  return src(['app-test/index.html']).pipe(gulpCopy('build/app-test', { prefix: 1 }));
}

// Optimise images
function minImages() {
  return src(paths.images.src)
    .pipe(imagemin())
    .pipe(dest(paths.images.dest));
}

// Default WMN Server
function server(done) {
  browserSync.init({
    server: {
      baseDir: paths.server.baseDir
    },
    port: paths.server.port
  });
  done();
}
// Swift Server
function serverSwift(done) {
  browserSync.init({
    server: {
      baseDir: paths.serverSwift.baseDir
    },
    port: paths.serverSwift.port,
    index: paths.serverSwift.index
  });
  done();
}
// Oneapp Server
function serverOneapp(done) {
  browserSync.init({
    server: {
      baseDir: paths.serverOneapp.baseDir
    },
    port: paths.serverOneapp.port,
    index: paths.serverOneapp.index
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
  buildTfwmScripts,
  buildOneappScripts,
  buildAppScripts,
  buildAppTestScripts,
  buildStyles,
  buildSwiftStyles,
  buildTemplates,
  buildAppTemplates,
  buildAppTestTemplates,
  buildSharedTemplates,
  buildSharedSwiftTemplates,
  buildSharedOneappTemplates,
  buildSharedAppTemplates,
  buildSharedAppTestTemplates,
  buildSwiftTemplates,
  buildOneappTemplates,
  lintScripts,
  lintTemplates,
  lintSharedTemplates,
  lintSharedSwiftTemplates,
  lintSharedOneappTemplates,
  lintSharedAppTemplates,
  lintSharedAppTestTemplates,
  lintSwiftTemplates,
  lintOneappTemplates,
  lintAppTemplates,
  lintAppTestTemplates,
  moveMain,
  moveTfWM,
  moveSwift,
  moveOneapp,
  moveApp,
  moveAppTest
);
// Watch files for changes
function watchFiles() {
  // Lint, concat, minify JS then reload server
  watch([paths.scripts.src], series(lintScripts, buildScripts, reload));
  watch(
    './**/*.html',
    series(
      lintTemplates,
      lintSharedTemplates,
      lintSharedSwiftTemplates,
      lintSharedOneappTemplates,
      lintSharedAppTemplates,
      lintSharedAppTestTemplates,
      lintSwiftTemplates,
      lintOneappTemplates,
      lintAppTemplates,
      lintAppTestTemplates,
      buildTemplates,
      buildAppTemplates,
      buildAppTestTemplates,
      buildSharedTemplates,
      buildSharedSwiftTemplates,
      buildSharedOneappTemplates,
      buildSharedAppTemplates,
      buildSharedAppTestTemplates,
      buildSwiftTemplates,
      buildOneappTemplates,
      reload
    )
  ); // Reload when html changes
  watch(paths.images.src, minImages);
  watch(paths.styles.src, buildStyles); // run buildStyles function on scss change(s)
  watch(paths.stylesSwift.src, buildSwiftStyles); // run buildSwiftStyles function on scss change(s) - swift
  watch(paths.ticketStyles.src, buildStyles); // update custom ticket product page scss
  watch(paths.ticketStyles.src, buildSwiftStyles); // update custom ticket product page scss
  watch(paths.ticketsStyles.src, buildStyles); // update custom ticket search scss
  watch(paths.ticketsStyles.src, buildSwiftStyles); // update custom ticket search scss
  watch(['./package.json', './gulpfile.js'], series(buildAll, reload));
}
// Default WMN
const dev = series(
  lintScripts,
  lintTemplates,
  lintSharedTemplates,
  lintSharedSwiftTemplates,
  lintSharedOneappTemplates,
  lintSharedAppTemplates,
  lintSharedAppTestTemplates,
  lintSwiftTemplates,
  lintOneappTemplates,
  lintAppTemplates,
  lintAppTestTemplates,
  parallel(
    buildStyles,
    buildSwiftStyles,
    buildScripts,
    buildTfwmScripts,
    buildOneappScripts,
    buildAppScripts,
    buildAppTestScripts,
    buildTemplates,
    buildAppTemplates,
    buildAppTestTemplates,
    buildSharedTemplates,
    buildSharedSwiftTemplates,
    buildSharedOneappTemplates,
    buildSharedAppTemplates,
    buildSharedAppTestTemplates,
    buildSwiftTemplates,
    buildOneappTemplates,
    minImages,
    moveMain,
    moveTfWM,
    moveSwift,
    moveOneapp,
    moveApp,
    moveAppTest
  ),
  parallel(watchFiles, server)
); // run buildStyles & minifyJS on start, series so () => run in an order and parallel so () => can run at same time
// Swift version
const devSwift = series(
  lintScripts,
  lintTemplates,
  lintSharedTemplates,
  lintSharedSwiftTemplates,
  lintSwiftTemplates,
  parallel(buildSwiftStyles, buildScripts, buildSwiftTemplates, minImages),
  parallel(watchFiles, serverSwift)
);
// Oneapp version
const devOneapp = series(
  lintScripts,
  lintTemplates,
  lintSharedTemplates,
  lintSharedOneappTemplates,
  lintSharedAppTemplates,
  lintSharedAppTestTemplates,
  lintOneappTemplates,
  lintAppTemplates,
  lintAppTestTemplates,
  parallel(buildStyles, buildScripts, buildOneappTemplates, minImages),
  parallel(watchFiles, serverOneapp)
);
// Export items to be used in terminal
exports.default = dev;
exports.defaultSwift = devSwift;
exports.defaultOneapp = devOneapp;
exports.lintScripts = lintScripts;
exports.lintTemplates = series(
  lintTemplates,
  lintSharedTemplates,
  lintSharedSwiftTemplates,
  lintSharedOneappTemplates,
  lintSharedAppTemplates,
  lintSharedAppTestTemplates,
  lintSwiftTemplates,
  lintOneappTemplates,
  lintAppTemplates,
  lintAppTemplates
);
exports.clean = cleanBuild;
exports.buildScripts = series(buildScripts, lintScripts);
exports.buildTfwmScripts = series(buildTfwmScripts);
exports.buildOneappScripts = series(buildOneappScripts);
exports.buildAppScripts = series(buildAppScripts);
exports.buildAppTestScripts = series(buildAppTestScripts);
exports.buildStyles = buildStyles;
exports.buildSwiftStyles = buildSwiftStyles;
exports.buildTemplates = series(
  buildTemplates,
  buildAppTemplates,
  buildAppTestTemplates,
  buildSharedTemplates,
  buildSharedSwiftTemplates,
  buildSharedOneappTemplates,
  buildSwiftTemplates,
  buildOneappTemplates
);
exports.moveMain = moveMain;
exports.moveTfWM = moveTfWM;
exports.moveSwift = moveSwift;
exports.moveOneapp = moveOneapp;
exports.moveApp = moveApp;
exports.moveAppTest = moveAppTest;
exports.minImages = minImages;
exports.buildAll = buildAll;
