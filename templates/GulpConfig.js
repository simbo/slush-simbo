/**
 * + Gulp Config
 * =====================================================================
 */

module.exports = (function(config) {

    // required packages
    var path = require('path');

    // data
    var cwd = process.cwd(),
        pkgJson = require(cwd + '/package.json');
        bowerJson = require(cwd + '/bower.json');


    /**
     * + Paths
     * =====================================================================
     */

    config.paths = (function(p) {
        p.root      = cwd;
        p.node      = path.join(p.root, 'node_modules');
        p.bower     = path.join(p.root, 'bower_components');
        p.src       = path.join(p.root, 'src');
        p.web       = path.join(p.root, 'web');
        p.assetsDev = path.join(p.src,  'assets-dev');
        p.assets    = path.join(p.web,  'assets');
        return p;
    })({});

    /* = Paths */


    /**
      * + Gulp module options
      * =====================================================================
      */

    // gulp default params
    config.gulpParams = {
        environment: 'production'
    };

    // stylus options
    // https://github.com/stevelacy/gulp-stylus
    // https://github.com/jenius/accord/blob/master/docs/stylus.md
    config.stylus = {
        // add imports and vendor folders to @import path
        paths: [
            path.join(config.paths.assetsDev, 'stylus/imports'),
            path.join(config.paths.assetsDev, 'vendor')
        ],
        // function for generating base64 data-uris
        url: {
            name: 'inline-url',
            paths: [
                path.join(config.paths.assetsDev, 'img'),
                path.join(config.paths.assetsDev, 'fonts')
            ],
            limit: false
        },
        // create sourcemaps containing inline sources
        sourcemap: {
            inline: true,
            sourceRoot: '.',
            basePath: path.join(path.relative(config.paths.web, config.paths.assets), 'css')
        }
    };

    // autoprefixer options
    // https://github.com/postcss/autoprefixer
    // https://github.com/ai/browserslist#queries
    config.autoprefixer = {
        browsers: [
            'last 2 versions',
            '> 2%',
            'Opera 12.1',
            'Firefox ESR'
        ]
    };

    // csslint options
    // https://github.com/CSSLint/csslint/wiki/Rules-by-ID
    config.csslint = {
        'box-model': false,
        'box-sizing': false,
        'bulletproof-font-face': false,
        'compatible-vendor-prefixes': false,
        'fallback-colors': false,
        'important': false,
        'outline-none': false,
        'unique-headings': false,
        'universal-selector': false
    };

    // jshint options
    config.jshint = {
        lookup: false
    };

    // configsync options
    // https://github.com/danlevan/gulp-config-sync
    config.configSync = {
        fields: [
            'name',
            'version',
            'description',
            'version'
        ],
        space: 2
    };

    // svgmin options
    // https://github.com/ben-eb/gulp-svgmin
    // https://github.com/svg/svgo/tree/master/plugins
    config.svgmin = {
        js2svg: {
            pretty: true
        },
        plugins: [{
            cleanupIDs: false
        }, {
            mergePaths: false
        }, {
            removeTitle: true
        }]
    };

    // global watch task options
    config.watch = {
        mode: 'auto'
    };

    // watch task defintions
    config.watchTasks = {
        stylus: {
            glob: '**/*.styl',
            cwd: path.join(config.paths.assetsDev, 'stylus'),
            start: 'build:css'
        },
        js: {
            glob: '**/*.js',
            cwd: path.join(config.paths.assetsDev, 'js'),
            start: 'build:js'
        }
    };

    // copy task definitions
    config.copyTasks = {
        collection: {
            src: '**/*',
            cwd: 'collection.stylus/src/stylus',
            toDev: true
        },
        jquery: {
            src: 'jquery.min.*',
            cwd: 'jquery/dist'
        }
    };

    /* = Gulp module options */


    return config;
})({});

/* = Gulp Config */
