/**
 * slush-simbo
 * ===========
 * https://github.com/simbo/slush-simbo
 *
 * Copyright © 2015 Simon Lepel <simbo@simbo.de>
 * Licensed under the MIT license.
 */

'use strict';


// required modules
var _            = require('lodash'),
    autoPlug     = require('auto-plug'),
    childProcess = require('child_process'),
    fs           = require('fs'),
    gulp         = require('gulp'),
    ini          = require('ini'),
    inquirer     = require('inquirer'),
    minimist     = require('minimist'),
    path         = require('path'),
    util         = require('util');


function Generator() {

    // some variables
    this.cwd = process.cwd();
    this.pkgDir = __dirname;
    this.pkgJson = require(path.join(this.pkgDir, 'package.json'));
    this.homePath = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
    this.templatesPath = path.join(this.pkgDir, 'templates');
    this.savedDataFile = path.join(this.homePath, '.' + this.pkgJson.name);
    this.savedData = fs.existsSync(this.savedDataFile) ? ini.parse(fs.readFileSync(this.savedDataFile, 'utf-8')) : false;

    // auto-require gulp plugins
    this.gulpPlugins = autoPlug({ prefix: 'gulp', config: this.pkgJson });

    // parse cli params
    this.parseParams();

    // set defaults
    this.setDefaultOptions();

    // set gulp task
    gulp.task('default', this.gulpTask.bind(this));

}


_.assign(Generator.prototype, {


    setDefaultOptions: function() {
        var options = {
                authorName: path.basename(this.homePath),
                authorEmail: '',
                authorUrl: '',
                authorGithubUser: path.basename(this.homePath),
                projectName: path.basename(this.cwd),
                projectDescription: '',
                projectLicenseType: 'MIT',
                projectVersion: '0.1.0',
                vagrant: false,
                webserver: 'connect',
                website: 'html',
                php: false,
                database: 'none',
                phpmyadmin: false,
                bower: false,
                travis: true,
                vagrantUp: false,
                install: false
            };
        if (!this.savedData) {
            var gitconfig = path.join(home, '.gitconfig');
            if (fs.existsSync(gitconfig)) {
                var gitconfigData = ini.parse(fs.readFileSync(gitconfig, 'utf-8'));
                options.authorName = gitconfigData.user.name;
                options.authorEmail = gitconfigData.user.email;
            }
        }
        else {
            options.authorName = this.savedData.authorName;
            options.authorEmail = this.savedData.authorEmail;
            options.authorUrl = this.savedData.authorUrl;
            options.authorGithubUser = this.savedData.authorGithubUser;
        }
        this.defaultOptions = options;
    },


    parseParams: function() {
        var cliParams = minimist(process.argv.slice(3));
        this.params = {
            silent: cliParams.silent===true || cliParams.s===true || cliParams.S===true || false
        };
    },


    // get url of github repo or repo's issues
    getGithubUrl: function (user, project, type) {
        var types = {
            repository: '.git',
            issues: '/issues'
        };
        type = Object.keys(types).indexOf(type)===-1 ? 'repository' : type;
        return 'https://github.com/' + user + '/' + project + types[type];
    },


    // get url for license
    getLicenseUrl: function (license) {
        switch(license.toLowerCase()) {
            case 'mit':
                return 'http://' + this.defaultOptions.authorGithubUser + '.mit-license.org/';
            case 'gpl':
            case 'gpl3':
                return 'https://www.gnu.org/licenses/gpl-3.0.txt';
            case 'gpl2':
                return 'https://www.gnu.org/licenses/gpl-2.0.txt';
            default:
                return '';
        }
    },


    // parse answers, generate options object
    setOptions: function (answers) {
        var options = _.merge({}, this.defaultOptions, answers || {});
        if (this.savedData && options.useSavedAuthorData) {
            options = _.merge(options, this.savedData);
        }
        options.projectLicenseYear = new Date().getFullYear();
        if (!options.projectLicenseUrl) {
            options.projectLicenseUrl = this.getLicenseUrl(this.defaultOptions.projectLicenseType);
        }
        if (!options.projectRepositoryUrl) {
            options.projectRepositoryUrl = this.getGithubUrl(this.defaultOptions.authorGithubUser, this.defaultOptions.projectName);
        }
        if (!options.projectBugtrackerUrl) {
            options.projectBugtrackerUrl = this.getGithubUrl(this.defaultOptions.authorGithubUser, this.defaultOptions.projectName, 'issues');
        }
        this.options = options;
    },


    // scaffold the project
    scaffold: function (done) {
        var childProcessOptions = {
                stdio: 'inherit',
                cwd: this.cwd
            },
            templates = require(path.join(this.pkgDir, 'templates.js'))(this);
        gulp.src(templates, {
                dot: true,
                base: this.templatesPath
            })
            .pipe(this.gulpPlugins.template(this.options))
            .pipe(this.gulpPlugins.conflict(this.cwd + '/'))
            .pipe(gulp.dest(this.cwd + '/'))
            .on('end', this.afterScaffolding.bind(this, done));
    },


    afterScaffolding: function (done) {
        if (this.options.install) {
            childProcess.spawnSync('npm', ['install'], childProcessOptions);
        }
        if (this.options.vagrantUp) {
            childProcess.spawnSync('vagrant', ['up'], childProcessOptions);
        }
        return done();
    },


    // save author data to file
    saveAuthorData: function() {
        fs.writeFileSync(this.savedDataFile, ini.stringify({
            authorName: this.options.authorName,
            authorEmail: this.options.authorEmail,
            authorUrl: this.options.authorUrl,
            authorGithubUser: this.options.authorGithubUser,
        }));
    },


    // the actual gulp task
    gulpTask: function (done) {
        if (this.params.silent) {
            this.setOptions();
            this.scaffold(done);
        }
        else {
            var prompts = require(path.join(this.pkgDir, 'prompts.js'))(this);
            inquirer.prompt(prompts, function (answers) {
                if (!answers.continue) {
                    return done();
                }
                this.setOptions(answers);
                if (answers.saveAuthorData) {
                    this.saveAuthorData();
                }
                this.scaffold(done);
            }.bind(this));
        }
    }


});


var generator = new Generator();
