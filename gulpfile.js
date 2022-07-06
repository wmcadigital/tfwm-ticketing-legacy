const { src, dest, watch, series, parallel } = require('gulp');
// SASS vars
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
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

const json = JSON.parse(fs.readFileSync('./package.json'));

let build = 'live';
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
    baseDir: './',
    index: 'index.html'
  },
  serverSwift: {
    port: 8080,
    baseDir: './',
    index: 'index-swift.html'
  },
  serverOneapp: {
    port: 8080,
    baseDir: './',
    index: 'index-oneapp.html'
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
      { src: 'src/app/js/oneapp/*.js', minName: 'oneapp.app.min.js', lint: true },
      { src: 'src/assets/**/*.js', minName: 'assets.min.js', lint: false },
      { src: 'src/app/services/*.js', minName: 'services.min.js', lint: true },
      { src: 'src/app/shared/*.js', minName: 'shared.min.js', lint: true },
      { src: 'src/app/controller/*.js', minName: 'controller.min.js', lint: true },
      { src: 'src/app/directives/*.js', minName: 'directives.min.js', lint: true }
    ],
    output: 'build/js/' // Output location of minified JS files
  },
  templates: {
    src: './src/app/**/views/wmn/*.html',
    minName: 'partials.min.js'
  },
  templatesShared: {
    src: './src/app/**/views/shared/*.html',
    minName: 'shared.partials.min.js'
  },
  templatesSwiftShared: {
    src: './src/app/**/views/shared/*.html',
    minName: 'swift.shared.partials.min.js'
  },
  templatesOneappShared: {
    src: './src/app/**/views/shared/*.html',
    minName: 'oneapp.shared.partials.min.js'
  },
  templatesSwift: {
    src: './src/app/**/views/swift/*.html',
    minName: 'swift.partials.min.js'
  },
  templatesOneapp: {
    src: './src/app/**/views/oneapp/*.html',
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
  buildStyles,
  buildSwiftStyles,
  buildTemplates,
  buildSharedTemplates,
  buildSharedSwiftTemplates,
  buildSharedOneappTemplates,
  buildSwiftTemplates,
  buildOneappTemplates,
  lintScripts,
  lintTemplates,
  lintSharedTemplates,
  lintSharedSwiftTemplates,
  lintSharedOneappTemplates,
  lintSwiftTemplates,
  lintOneappTemplates
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
      lintSwiftTemplates,
      lintOneappTemplates,
      buildTemplates,
      buildSharedTemplates,
      buildSharedSwiftTemplates,
      buildSharedOneappTemplates,
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
  lintSwiftTemplates,
  lintOneappTemplates,
  parallel(
    buildStyles,
    buildSwiftStyles,
    buildScripts,
    buildTemplates,
    buildSharedTemplates,
    buildSharedSwiftTemplates,
    buildSharedOneappTemplates,
    buildSwiftTemplates,
    buildOneappTemplates,
    minImages
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
  lintOneappTemplates,
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
  lintSwiftTemplates,
  lintOneappTemplates
);
exports.clean = cleanBuild;
exports.buildScripts = series(buildScripts, lintScripts);
exports.buildStyles = buildStyles;
exports.buildSwiftStyles = buildSwiftStyles;
exports.buildTemplates = series(
  buildTemplates,
  buildSharedTemplates,
  buildSharedSwiftTemplates,
  buildSharedOneappTemplates,
  buildSwiftTemplates,
  buildOneappTemplates,
  lintTemplates
);
exports.minImages = minImages;
exports.buildAll = buildAll;
