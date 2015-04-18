/**
 * slush-simbo
 * ===================
 * https://github.com/simbo/slush-simbo
 *
 * Copyright © 2015 Simon Lepel <simbo@simbo.de>
 * Licensed under the MIT license.
 */
'use strict';


// required modules
var _        = require('lodash'),
    autoPlug = require('auto-plug'),
    chalk    = require('chalk'),
    fs       = require('fs'),
    gulp     = require('gulp'),
    ini      = require('ini'),
    inquirer = require('inquirer'),
    minimist = require('minimist'),
    path     = require('path'),
    util     = require('util');


// some variables
var cwd = process.cwd(),
    pkgDir = __dirname,
    pkgJson = require(path.join(pkgDir, 'package.json')),
    home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE,
    templates = path.join(pkgDir, 'templates'),
    savedDataFile = path.join(home, '.' + pkgJson.name),
    savedData = fs.existsSync(savedDataFile) ? ini.parse(fs.readFileSync(savedDataFile, 'utf-8')) : false;


// auto-require plugins
var g = autoPlug({ prefix: 'gulp', config: pkgJson });


// cli params
var params = (function () {
        var cliParams = minimist(process.argv.slice(3)),
            params = {
                silent: cliParams.silent===true || cliParams.s===true || cliParams.S===true || false
            };
        return params;
    })();


// default options
var defaultOptions = (function () {
        var options = {
            authorName: savedData ? savedData.authorName : path.basename(home),
            authorEmail: savedData ? savedData.authorEmail : '',
            authorUrl: savedData ? savedData.authorUrl : '',
            authorGithubUser: savedData ? savedData.authorGithubUser : path.basename(home),
            projectName: path.basename(cwd),
            projectDescription: '',
            projectLicenseType: 'MIT',
            projectVersion: '0.1.0',
            optionVagrant: true,
            optionWebserver: 'nginx',
            optionWebsite: 'html',
            optionPhp: false,
            optionDatabase: 'none',
            optionPhpmyadmin: false,
            optionTravis: true,
            optionVagrantUp: false,
            optionInstall: false
        };
        if (!savedData) {
            var gitconfig = path.join(home, '.gitconfig');
            if (fs.existsSync(gitconfig)) {
                var gitconfigData = ini.parse(fs.readFileSync(gitconfig, 'utf-8'));
                options.authorName = gitconfigData.user.name;
                options.authorEmail = gitconfigData.user.email;
            }
        }
        return options;
    })();


// inquirer questions
var prompts = [{
        name: 'useSavedAuthorData',
        type: 'confirm',
        when: function (answers) {
            return savedData ? true : false;
        },
        message: function (answers) {
            return 'Use this as author data?' +
                chalk.reset.gray('\nName: ') + chalk.yellow(savedData.authorName) +
                chalk.reset.gray('\nE-Mail: ') + chalk.yellow(savedData.authorEmail) +
                chalk.reset.gray('\nURL: ') + chalk.yellow(savedData.authorUrl) +
                chalk.reset.gray('\nGitHub User: ') + chalk.yellow(savedData.authorGithubUser) +
                '\n';
        }
    }, {
        name: 'authorName',
        when: function (answers) {
            return !savedData || !answers.useSavedAuthorData;
        },
        message: 'What is the ' + chalk.yellow('author\'s name') + '?',
        default: defaultOptions.authorName
    }, {
        name: 'authorEmail',
        when: function (answers) {
            return !savedData || !answers.useSavedAuthorData;
        },
        message: 'What is the ' + chalk.yellow('author\'s email') + '?',
        default: defaultOptions.authorEmail
    }, {
        name: 'authorUrl',
        when: function (answers) {
            return !savedData || !answers.useSavedAuthorData;
        },
        message: 'What is the ' + chalk.yellow('author\'s website') + '?',
        default: defaultOptions.authorUrl
    }, {
        name: 'authorGithubUser',
        when: function (answers) {
            return !savedData || !answers.useSavedAuthorData;
        },
        message: 'What is the ' + chalk.yellow('GitHub username') + '?',
        default: defaultOptions.authorGithubUser
    }, {
        name: 'saveAuthorData',
        type: 'confirm',
        when: function (answers) {
            return !savedData || !answers.useSavedAuthorData;
        },
        message: 'Do you want to ' + chalk.yellow('save author information') + ' for future project scaffolding?',
        default: true
    }, {
        name: 'projectName',
        message: 'What is the ' + chalk.yellow('name') + ' of your project?',
        default: defaultOptions.projectName
    }, {
        name: 'projectDescription',
        message: 'What is the ' + chalk.yellow('description') + ' of your project?',
        default: defaultOptions.projectDescription
    }, {
        name: 'projectVersion',
        message: 'What is the ' + chalk.yellow('version') + ' of your project?',
        default: defaultOptions.projectVersion
    }, {
        name: 'projectLicenseType',
        message: 'What ' + chalk.yellow('license') + ' do you want to use for your project?',
        default: defaultOptions.projectLicenseType
    }, {
        name: 'projectLicenseUrl',
        message: 'What is the ' + chalk.yellow('url for license') + ' information?',
        default: function (answers) {
            return getLicenseUrl(answers.projectLicenseType);
        }
    }, {
        name: 'projectRepositoryUrl',
        message: 'What is the url of the project ' + chalk.yellow('repository') + '?',
        default: function (answers) {
            var githubUser = savedData.authorGithubUser || defaultOptions.authorGithubUser || answers.authorGithubUser;
            return githubUser ? getGithubUrl(githubUser, answers.projectName) : '';
        }
    }, {
        name: 'projectBugtrackerUrl',
        message: 'What is the url of the project ' + chalk.yellow('bug tracker') + '?',
        default: function (answers) {
            var githubUser = savedData.authorGithubUser || defaultOptions.authorGithubUser || answers.authorGithubUser;
            return githubUser ? getGithubUrl(githubUser, answers.projectName, 'issues') : '';
        }
    }, {
        name: 'optionVagrant',
        type: 'confirm',
        message: 'Do you want to use ' + chalk.yellow('Vagrant') + '?',
        default: defaultOptions.optionVagrant
    }, {
        name: 'optionWebserver',
        type: 'list',
        when: function(answers) {
            return answers.optionVagrant;
        },
        message: 'What kind of ' + chalk.yellow('webserver') + ' do you want to use?',
        choices: [{
            name: 'nginx',
            value: 'nginx'
        }, {
            name: 'Apache2',
            value: 'apache'
        }, {
            name: 'Connect (node.js)',
            value: 'connect'
        }],
        default: function(answers) {
            return answers.optionVagrant ? defaultOptions.optionWebserver : 'connect'
        }
    }, {
        name: 'optionPhp',
        type: 'confirm',
        when: function(answers) {
            return ['nginx', 'apache'].indexOf(answers.optionWebserver)!==-1;
        },
        message: 'Do want to install ' + chalk.yellow('PHP') + '?',
        default: defaultOptions.optionPhp
    }, {
        name: 'optionDatabase',
        type: 'list',
        when: function(answers) {
            return answers.optionVagrant;
        },
        message: 'Do want to setup a ' + chalk.yellow('database') + '?',
        choices: [{
            name: 'No',
            value: 'none'
        }, {
            name: 'MySQL',
            value: 'mysql'
        }, {
            name: 'CouchDB',
            value: 'couchdb'
        }],
        default: defaultOptions.optionDatabase
    }, {
        name: 'optionPhpmyadmin',
        type: 'confirm',
        when: function(answers) {
            return answers.optionDatabase==='mysql' && answers.optionPhp;
        },
        message: 'Do you want to install ' + chalk.yellow('phpMyAdmin') + '?',
        default: function(answers) {
            return answers.optionDatabase==='mysql' && answers.optionPhp ? true : defaultOptions.optionPhpmyadmin;
        }
    }, {
        name: 'optionWebsite',
        type: 'list',
        message: 'What kind of basic ' + chalk.yellow('website') + ' do you want to setup?',
        choices: [{
            name: 'Single HTML file',
            value: 'html'
        }, {
            name: 'Metalsmith (static site generator)',
            value: 'metalsmith'
        }],
        default: defaultOptions.optionWebsite
    }, {
        name: 'optionTravis',
        type: 'confirm',
        message: 'Do you want to add ' + chalk.yellow('Travis CI') + ' support?',
        default: defaultOptions.optionTravis
    }, {
        name: 'optionVagrantUp',
        type: 'confirm',
        when: function(answers) {
            return answers.optionVagrant;
        },
        message: 'Do you want to run ' + chalk.yellow('vagrant up') + ' after scaffolding?',
        default: defaultOptions.optionVagrantUp
    }, {
        name: 'optionInstall',
        type: 'confirm',
        when: function(answers) {
            return !answers.optionVagrant;
        },
        message: 'Do you want to ' + chalk.yellow('install') + ' npm and bower packages after scaffolding?',
        default: function(ansers) {
            return answers.optionVagrant ? false : defaultOptions.optionInstall;
        }
    }, {
        name: 'continue',
        type: 'confirm',
        message: 'Please check your answers. ' + chalk.yellow('Continue') + '?'
    }];


// get url of github repo or repo's issues
function getGithubUrl (user, project, type) {
    var types = {
        repository: '.git',
        issues: '/issues'
    };
    type = Object.keys(types).indexOf(type)===-1 ? 'repository' : type;
    return 'https://github.com/' + user + '/' + project + types[type];
}


// get url for license
function getLicenseUrl (license) {
    switch(license.toLowerCase()) {
        case 'mit':
            return 'http://' + defaultOptions.authorGithubUser + '.mit-license.org/';
        case 'gpl':
        case 'gpl3':
            return 'https://www.gnu.org/licenses/gpl-3.0.txt';
        case 'gpl2':
            return 'https://www.gnu.org/licenses/gpl-2.0.txt';
        default:
            return '';
    }
}


// parse answers, generate options object
function parseAnswers (answers) {
    var options = _.merge({}, answers);
    if (savedData && answers.useSavedAuthorData) {
        options = _.merge(options, savedData);
    }
    options.projectLicenseYear = new Date().getFullYear();
    return options;
}


// scaffold the project
function scaffold (options, done) {
    gulp.src([
            templates + '/**/*',
            ( options.optionTravis ? '' : '!' + templates + '/.travis.yml' )
        ], {dot: true})
        .pipe(g.template(options))
        .pipe(g.conflict(cwd + '/'))
        .pipe(gulp.dest(cwd + '/'))
        .pipe(g.if(
            options.optionInstall,
            g.install({ ignoreScripts: true })
        ))
        .on('end', function () {
            done();
        });
}


// the actual gulp task
gulp.task('default', function (done) {
    if (params.silent) {
        var options = _.merge({}, defaultOptions);
        options.projectLicenseUrl = getLicenseUrl(defaultOptions.projectLicenseType);
        options.projectRepositoryUrl = getGithubUrl(defaultOptions.authorGithubUser, defaultOptions.projectName);
        options.projectBugtrackerUrl = getGithubUrl(defaultOptions.authorGithubUser, defaultOptions.projectName, 'issues');
        scaffold(parseAnswers(options), done);
    }
    else {
        inquirer.prompt(prompts, function (answers) {
            if (!answers.continue) {
                return done();
            }
            var options = parseAnswers(answers);
            if (answers.saveAuthorData) {
                fs.writeFileSync(savedDataFile, ini.stringify({
                    authorName: options.authorName,
                    authorEmail: options.authorEmail,
                    authorUrl: options.authorUrl,
                    authorGithubUser: options.authorGithubUser,
                }));
            }
            scaffold(options, done);
        });
    }
});
