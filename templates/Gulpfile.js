/**
 * + Gulpfile
 * =====================================================================
 */
'use strict';

var _            = require('lodash'),
    autoPlug     = require('auto-plug'),
    autoprefixer = require('autoprefixer-core'),
    csswring     = require('csswring'),
    del          = require('del'),
    gulp         = require('gulp'),
    minimist     = require('minimist'),
    mqpacker     = require('css-mqpacker'),
    path         = require('path'),
    runSequence  = require('run-sequence');

// external data
var cwd = process.cwd(),
    config  = require(cwd + '/GulpConfig.js'),
    pkgJson = require(cwd + '/package.json');

// auto-require plugins
var g = autoPlug({ prefix: 'gulp', config: pkgJson });


/**
 * + Error handling
 * =====================================================================
 */

function handleError(err) {
    g.util.log(err.toString());
    this.emit('end');
}

/* = Error handling */


/**
 * + Parse CLI params
 * =====================================================================
 */

var params = (function(p){
        var cliParams = minimist(process.argv.slice(2));
        p.environment = cliParams.environment || cliParams.env || process.env.NODE_ENV || config.gulpParams.environment || 'production';
        return p;
    })({});

/* = Parse CLI params */


/**
 * + Stylus / CSS processing
 * =====================================================================
 */

gulp.task('build:css', ['clean:js'], function() {
    return gulp

        // grab all stylus files in stylus root folder
        .src(config.paths.assetsDev + '/stylus/*.styl')

        // pipe through stylus processor
        .pipe(g.stylus(config.stylus).on('error', handleError))

        // pipe through sourcemaps processor
        .pipe(g.sourcemaps.init({
            loadMaps: true
        }))

        // pipe through postcss processor
        .pipe(g.postcss((function(postcssPlugins){
                // minify only when in production mode
                if (params.environment === 'production') {
                    postcssPlugins.push(csswring(config.csswring));
                }
                return postcssPlugins;
            })([
                autoprefixer(config.autoprefixer),
                mqpacker
            ])
        ).on('error', handleError))

        // pipe through csslint if in development mode
        .pipe(g.if(
            params.environment === 'development',
            g.csslint(config.csslint)
        ))
        .pipe(g.csslint.reporter())

        // write sourcemaps
        .pipe(g.sourcemaps.write('.', {
            includeContent: true,
            sourceRoot: '.'
        }))

        // write processed styles
        .pipe(gulp.dest(path.join(config.paths.assets, 'css')))<% if (webserver==='connect') { %>

        // live-reload
        .pipe(g.connect.reload())<% } %>;

});

/* = Stylus / CSS processing */


/**
 * + Javascript processing
 * =====================================================================
 */

gulp.task('build:js', ['clean:js'], function() {
    return gulp

        // grab javascript files
        .src([
            path.join(config.paths.assetsDev, 'js/main.js')
        ])

        // concatenate into one file
        .pipe(g.concat('main.js'))

        // pipe through sourcemaps processor
        .pipe(g.sourcemaps.init())

        // pipe through jshint if in development mode
        .pipe(g.if(
            params.environment === 'development',
            g.jshint(config.jshint)
        ))
        .pipe(g.jshint.reporter())

        // uglify if in production mode
        .pipe(g.if(
            params.environment === 'production',
            g.uglify()
        ))

        // write sourcemaps containing inline sources
        .pipe(g.sourcemaps.write('.', {
            includeContent: true,
            sourceRoot: '.'
        }))

        // write processed javascripts
        .pipe(gulp.dest(path.join(config.paths.assets, 'js')))<% if (webserver==='connect') { %>

        // live-reload
        .pipe(g.connect.reload())<% } %>;

});

/* = Javascript processing */


/**
 * + Copy tasks
 * =====================================================================
 */

// create copy tasks
var copySequence = [];
Object.keys(config.copyTasks).forEach(function(name) {
    var task = config.copyTasks[name],
        taskName = 'copy:' + name;
    task.baseCwd = task.hasOwnProperty('baseCwd') ? task.baseCwd : config.paths.node;
    task.toDev = task.hasOwnProperty('toDev') ? task.toDev : true;
    gulp.task(taskName, function() {
        return gulp
            .src(task.src, {
                cwd: path.join(task.baseCwd, task.cwd),
                base: path.join(task.baseCwd, task.cwd)
            })
            .pipe(g.if(task.hasOwnProperty('extReplace'), g.extReplace(task.extReplace)))
            .pipe(gulp.dest(path.join(config.paths[task.toDev ? 'assetsDev' : 'assetsSrc'], 'vendor', name)));
    });
    copySequence.push(taskName);
});

// copy all dependencies
gulp.task('copy:deps', ['clean:deps'], function(done) {
    runSequence(copySequence, done);
});

/* = Copy tasks */<% if (bower) { %>


/**
 * + Config sync task
 * =====================================================================
 */

gulp.task('config-sync', function() {
    return gulp
        .src(path.join(config.paths.root, 'bower.json'))
        .pipe(g.configSync(config.configSync))
        .pipe(gulp.dest(config.paths.root));
});

/* = Config sync task */<% } %>


/**
 * + Clean Tasks
 * =====================================================================
 */

// clean generated content
gulp.task('clean:css', function(done) {
    del(path.join(config.paths.assets, 'css'), done);
});
gulp.task('clean:js', function(done) {
    del(path.join(config.paths.assets, 'js'), done);
});

// clean all dependencies
gulp.task('clean:deps', function(done) {
    del([
        path.join(config.paths.assets, 'vendor'),
        path.join(config.paths.assetsDev, 'vendor')
    ], done);
});

/* = Clean Tasks */


/**
 * + Watch Task
 * =====================================================================
 */

gulp.task('watch', function() {

    // show watch info in console
    function logWatchInfo(event) {
        var eventPath = path.relative(config.paths.root, event.path);
        g.util.log('File \'' + g.util.colors.cyan(eventPath) + '\' was ' + g.util.colors.yellow(event.type) + ', running tasks...');
    }

    // create watch tasks
    Object.keys(config.watchTasks).forEach(function(key) {
        var task = config.watchTasks[key];
        gulp.watch(task.glob, _.merge({ cwd: task.cwd }, config.watch), function(event) {
            logWatchInfo(event);
            if (_.isArray(task.start)) {
                runSequence.apply(this|gulp, task.start);
            }
            else {
                gulp.start(task.start);
            }
        });
    });

});

/* = Watch Task */<% if (webserver==='connect') %>


/**
 * + Server Task
 * =====================================================================
 */

gulp.task('livereload', function() {
    gulp.src(config.paths.web)
        .pipe(g.connect.reload());
});

gulp.task('serve', function() {
    g.connect.server({
        port: 8080,
        root: config.paths.web,
        livereload: true
    });
});

/* = Server Task */<% } %>


/**
 * + SVG Cleanup Task
 * =====================================================================
 */

gulp.task('svgmin', function() {
    return gulp
        .src(config.paths.assetsDev + '/img/raw/**/*.svg')
        .pipe(g.svgmin(config.svgmin))
        .pipe(gulp.dest(config.paths.assetsDev + '/img'));
});

/* = SVG Cleanup Task */


/**
 * + Common tasks
 * =====================================================================
 */

// default task
gulp.task('default', ['build']);

// full build
gulp.task('build', ['copy:deps'<% if (bower) { %>, 'config-sync'<% } %>], function(done) {
    runSequence(
        ['build:css', 'build:js'],
        done
    );
});

// build<% if (webserver==='connect') { %>, serve<% } %> and watch
gulp.task('dev', ['build'], function() {
    gulp.start(<% if (webserver==='connect') { %>'serve', <% } %>'watch');
});

/* = Common tasks */


/* = Gulpfile */
