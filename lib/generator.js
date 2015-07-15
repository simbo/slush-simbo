/**
 * Generator Class
 */

'use strict';


// required modules
var _        = require('lodash'),
    chalk    = require('chalk'),
    fs       = require('fs'),
    ini      = require('ini'),
    inquirer = require('inquirer'),
    minimist = require('minimist'),
    path     = require('path'),
    util     = require('util');


/**
 * Constructor
 */
function Generator() {

    // set some path references
    this.cwd = process.cwd();
    this.pkgDir = path.dirname(__dirname);
    this.homePath = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE || '';
    this.templatesPath = path.join(this.pkgDir, 'templates');

    // get package.json data
    this.pkgJson = require(path.join(this.pkgDir, 'package.json'));

    // set file for saving global options
    this.globalOptionsFile = path.join(this.homePath, '.' + this.pkgJson.name);

    // auto-require gulp plugins
    this.gulpPlugins = require('auto-plug')({ prefix: 'gulp', config: this.pkgJson });

    // parse cli params
    this.parseParams();

    // load options config and saved config, set defaults
    this.init();

}

/**
 * assign class properties
 */
_.assign(Generator.prototype, {


    optionsConfigSuffix: {
        useSavedOptions: {
            default: true,
            prompt: {
                type: 'confirm',
                when: function (answers) {
                    console.log(util.inspect(this));
                    return this.savedOptionsExist() ? true : false;
                }.bind(this),
                message: function (answers) {
                    return 'Use this as author data?' +
                        chalk.reset.gray('\nName: ') + chalk.yellow(this.getSavedOption('authorName')) +
                        chalk.reset.gray('\nE-Mail: ') + chalk.yellow(this.getSavedOption('authorEmail')) +
                        chalk.reset.gray('\nURL: ') + chalk.yellow(this.getSavedOption('authorUrl')) +
                        chalk.reset.gray('\nGitHub User: ') + chalk.yellow(this.getSavedOption('authorGithubUser')) +
                        '\n';
                }.bind(this)
            }
        }
    },

    optionsConfigAppendix: {
        continue: {
            default: true,
            prompt: {
                type: 'confirm',
                message: 'Please check your answers. ' + chalk.yellow('Continue') + '?'
            }
        }
    }

});


/**
 * assign class methods
 */
_.assign(Generator.prototype, {

    /**
     * parse cli params
     * @return {void}
     */
    parseParams: function () {
        var cliParams = minimist(process.argv.slice(3));
        this.params = {
            silent: cliParams.silent===true || cliParams.s===true || cliParams.S===true || false
        };
    },

    /**
     * [init description]
     * @return {[type]} [description]
     */
    init: function () {
        this.loadGlobalOptions();
        this.loadGitConfig();
        var config = require('./config.js')(this);
        this.config = _.merge({}, this.optionsConfigSuffix, config, this.optionsConfigAppendix);
        this.parseOptions();
    },

    /**
     * [loadGlobalOptions description]
     * @return {[type]} [description]
     */
    loadGlobalOptions: function () {
        var iniData = fs.existsSync(this.savedOptionsFile) ? ini.parse(fs.readFileSync(this.savedOptionsFile, 'utf-8')) : {};
        this.savedOptions = _.isPlainObject(iniData) ? iniData : {}
    },


    saveGlobalOptions: function () {
        var globalOptions = {};
        this.config.forEach(function(option) {
            if (option.global===true) {
                globalOptions[option.name] = this.getOption(option.name);
            }
        });
        fs.writeFileSync(this.savedOptionsFile, ini.stringify(globalOptions));
    },


    savedOptionsExist: function () {
        return _.size(this.savedOptions)>0 ? true : false;
    },


    getSavedOption: function (name) {
        return this.savedOptions.hasOwnProperty(name) ? this.savedOptions[name] : null;
    },


    getOptionConfig: function (name) {
        return this.config.hasOwnProperty(name) ? this.config[name] : null;
    },


    getDefaultOption: function(name) {
        return this.defaultOptions.hasOwnProperty(name) ? this.defaultOptions[name] : null;
    },


    getOption: function(name) {
        return this.options.hasOwnProperty(name) ? this.options[name] : null;
    },


    loadGitConfig: function () {
        var gitConfigFile = path.join(this.homePath, '.gitconfig');
        this.gitConfig = {};
        if (fs.existsSync(gitConfigFile)) {
            this.gitConfig = ini.parse(fs.readFileSync(gitConfigFile, 'utf-8')) || {};
        }
    },


    parseOptions: function () {
        this.defaultOptions = {};
        this.prompts = [];
        this.afterScaffoldingFunctions = [];
        Object.keys(this.config).forEach(function (optionName) {
            var option = this.getOptionConfig(optionName);
            if (this.getSavedOption(optionName)!==null) {
                this.defaultOptions[optionName] = this.getSavedOption(optionName);
            }
            else {
                this.defaultOptions[optionName] = _.isFunction(option.default) ? option.default() : option.default;
            }
            if (option.hasOwnProperty('prompt')) {
                var prompt = option.prompt;
                prompt.name = optionName;
                if (!prompt.hasOwnProperty('default')) {
                    prompt.default = this.getDefaultOption(optionName);
                }
                this.prompts.push(prompt);
            }
            if (option.hasOwnProperty('afterScaffolding') && _.isFunction(option.afterScaffolding)) {
                this.afterScaffoldingFunctions.push(option.afterScaffolding);
            }
        }.bind(this));
    },


    // parse answers, generate options object
    setOptions: function () {
        this.options = _.merge({}, this.defaultOptions, this.answers || {});
        if (this.savedOptionsExist() && this.options.useSavedAuthorData) {
            _.merge(this.options, this.savedOptions);
        }
    },


    // the actual gulp task
    task: function (gulp, done) {
        this.gulp = gulp;
        this.done = done;
        if (!this.params.silent) {
            this.interview();
        }
        else {
            this.scaffold();
        }
    },


    interview: function() {
        inquirer.prompt(this.prompts, function (answers) {
            this.answers = answers;
            this.scaffold();
        }.bind(this));
    },



    // scaffold the project
    scaffold: function () {
        this.setOptions();
        var templates = require('./templates.js')(this);
        this.gulp.src(templates, {
                dot: true,
                base: this.templatesPath
            })
            .pipe(this.gulpPlugins.template(this.options))
            .pipe(this.gulpPlugins.conflict(this.cwd + '/'))
            .pipe(this.gulp.dest(this.cwd + '/'))
            .on('end', this.afterScaffolding.bind(this));
    },


    afterScaffolding: function () {
        this.afterScaffoldingFunctions.forEach(function (func) {
            func();
        });
        this.done();
    }


});

/**
 * export a new Generator instance
 * @type Generator
 */
module.exports = new Generator();
