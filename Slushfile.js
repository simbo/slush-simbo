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
var autoPlug = require('auto-plug'),
    chalk    = require('chalk'),
    fs       = require('fs'),
    gulp     = require('gulp'),
    ini      = require('ini'),
    inquirer = require('inquirer'),
    minimist = require('minimist'),
    path     = require('path'),
    util     = require('util');


// main variables
var cwd = process.cwd(),
    pkgDir = __dirname,
    pkgJson = require(path.join(pkgDir, 'package.json')),
    home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE,
    templates = path.join(pkgDir, 'templates'),
    savedDataFile = path.join(home, '.' + pkgJson.name),
    savedDataFileExists = fs.existsSync(savedDataFile),
    savedData = savedDataFileExists ? ini.parse(fs.readFileSync(savedDataFile, 'utf-8')) : { author: {} };


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
            author: {
                name: savedData.author.name || path.basename(home),
                email: savedData.author.email || '',
                url: savedData.author.url || '',
                githubUser: savedData.author.githubUser || path.basename(home)
            },
            project: {
                name: path.basename(cwd),
                license: 'MIT',
                version: '0.1.0'
            },
            options: {
                useVagrant: true,
                webserver: 'nginx',
                website: 'html',
                php: false,
                database: 'none',
                phpmyadmin: false,
                supportTravis: true,
                vagrantUp: false,
                runInstall: false
            }
        };
        if (!savedDataFileExists) {
            var gitconfig = path.join(home, '.gitconfig');
            if (fs.existsSync(gitconfig)) {
                var gitconfigData = ini.parse(fs.readFileSync(gitconfig, 'utf-8'));
                options.author.name = gitconfigData.user.name;
                options.author.email = gitconfigData.user.email;
            }
        }
        return options;
    })();


// inquirer questions
var prompts = [{
        when: function (answers) {
            return savedDataFileExists;
        },
        type: 'confirm',
        name: 'useSavedAuthorData',
        message: function (answers) {
            return 'Use this as author data?' +
                chalk.reset.gray('\nName: ') + chalk.yellow(savedData.author.name) +
                chalk.reset.gray('\nE-Mail: ') + chalk.yellow(savedData.author.email) +
                chalk.reset.gray('\nURL: ') + chalk.yellow(savedData.author.url) +
                chalk.reset.gray('\nGitHub User: ') + chalk.yellow(savedData.author.githubUser) +
                '\n';
        }
    }, {
        when: function (answers) {
            return !savedDataFileExists || !answers.useSavedAuthorData;
        },
        name: 'authorName',
        message: 'What is the ' + chalk.yellow('author\'s name') + '?',
        default: defaultOptions.author.name
    }, {
        when: function (answers) {
            return !savedDataFileExists || !answers.useSavedAuthorData;
        },
        name: 'authorEmail',
        message: 'What is the ' + chalk.yellow('author\'s email') + '?',
        default: defaultOptions.author.email
    }, {
        when: function (answers) {
            return !savedDataFileExists || !answers.useSavedAuthorData;
        },
        name: 'authorUrl',
        message: 'What is the ' + chalk.yellow('author\'s website') + '?',
        default: defaultOptions.author.url
    }, {
        when: function (answers) {
            return !savedDataFileExists || !answers.useSavedAuthorData;
        },
        name: 'githubUser',
        message: 'What is the ' + chalk.yellow('GitHub username') + '?',
        default: defaultOptions.author.githubUser
    }, {
        when: function (answers) {
            return !savedDataFileExists || !answers.useSavedAuthorData;
        },
        name: 'saveAuthorData',
        type: 'confirm',
        message: 'Do you want to ' + chalk.yellow('save author information') + ' for future project scaffolding?'
    }, {
        name: 'projectName',
        message: 'What is the ' + chalk.yellow('name') + ' of your project?',
        default: defaultOptions.project.name
    }, {
        name: 'projectDescription',
        message: 'What is the ' + chalk.yellow('description') + ' of your project?',
    }, {
        name: 'projectVersion',
        message: 'What is the ' + chalk.yellow('version') + ' of your project?',
        default: defaultOptions.project.version
    }, {
        name: 'license',
        message: 'What ' + chalk.yellow('license') + ' do you want to use for your project?',
        default: 'MIT'
    }, {
        name: 'licenseUrl',
        message: 'What is the ' + chalk.yellow('url for license') + ' information?',
        default: function (answers) {
            return getLicenseUrl(answers.license.toLowerCase());
        }
    }, {
        name: 'repository',
        message: 'What is the url of the project ' + chalk.yellow('repository') + '?',
        default: function (answers) {
            var githubUser = savedData.githubUser || defaultOptions.author.githubUser || answers.githubUser;
            if (githubUser) {
                return getGithubUrl(githubUser, answers.projectName);
            }
            return '';
        }
    }, {
        name: 'bugs',
        message: 'What is the url of the project ' + chalk.yellow('bug tracker') + '?',
        default: function (answers) {
            var githubUser = savedData.githubUser || defaultOptions.author.githubUser || answers.githubUser;
            if (githubUser) {
                return getGithubUrl(githubUser, answers.projectName, 'issues');
            }
            return '';
        }
    }, {
        type: 'confirm',
        name: 'useVagrant',
        message: 'Do you want to use ' + chalk.yellow('Vagrant') + '?',
        default: defaultOptions.options.useVagrant
    }, {
        when: function(answers) {
            return answers.useVagrant;
        },
        type: 'list',
        name: 'webserver',
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
            return answers.useVagrant ? defaultOptions.options.webserver : 'connect'
        }
    }, {
        when: function(answers) {
            return ['nginx', 'apache'].indexOf(answers.webserver)!==-1;
        },
        type: 'confirm',
        name: 'php',
        message: 'Do want to install ' + chalk.yellow('PHP') + '?',
        default: defaultOptions.options.php
    }, {
        when: function(answers) {
            return answers.useVagrant;
        },
        type: 'list',
        name: 'database',
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
        default: defaultOptions.options.database
    }, {
        when: function(answers) {
            return answers.database==='mysql';
        },
        type: 'confirm',
        name: 'phpmyadmin',
        message: 'Do you want to install ' + chalk.yellow('phpMyAdmin') + '?',
        default: function(answers) {
            return answers.database==='mysql' ? true : defaultOptions.options.phpmyadmin;
        }
    }, {
        type: 'list',
        name: 'website',
        message: 'What kind of basic ' + chalk.yellow('website') + ' do you want to setup?',
        choices: [{
            name: 'Single HTML file',
            value: 'html'
        }, {
            name: 'Metalsmith (static site generator)',
            value: 'metalsmith'
        }],
        default: defaultOptions.options.website
    }, {
        type: 'confirm',
        name: 'supportTravis',
        message: 'Do you want to add ' + chalk.yellow('Travis CI') + ' support?',
        default: defaultOptions.options.supportTravis
    }, {
        when: function(answers) {
            return answers.useVagrant;
        },
        type: 'confirm',
        name: 'vagrantUp',
        message: 'Do you want to run ' + chalk.yellow('vagrant up') + ' after scaffolding?',
        default: defaultOptions.options.vagrantUp
    }, {
        when: function(answers) {
            return !answers.useVagrant;
        },
        type: 'confirm',
        name: 'runInstall',
        message: 'Do you want to ' + chalk.yellow('install') + ' npm and bower packages after scaffolding?',
        default: function(ansers) {
            return answers.useVagrant ? false : defaultOptions.options.runInstall;
        }
    }, {
        type: 'confirm',
        name: 'moveon',
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
            return 'http://' + defaultOptions.author.githubUser + '.mit-license.org/';
        case 'gpl':
        case 'gpl3':
            return 'https://www.gnu.org/licenses/gpl-3.0.txt';
        case 'gpl2':
            return 'https://www.gnu.org/licenses/gpl-2.0.txt';
        default:
            return '';
    }
}


// parse answers, generate data object
function parseAnswers (answers) {
    return {
        project: {
            name: answers.projectName,
            description: answers.projectDescription,
            version: answers.projectVersion,
        },
        author: {
            name: savedDataFileExists && answers.useSavedAuthorData ? savedData.author.name : answers.authorName,
            email: savedDataFileExists && answers.useSavedAuthorData ? savedData.author.email : answers.authorEmail,
            url: savedDataFileExists && answers.useSavedAuthorData ? savedData.author.url : answers.authorUrl,
            githubUser: savedDataFileExists && answers.useSavedAuthorData ? savedData.author.githubUser : answers.githubUser
        },
        repository: {
            type: 'git',
            url: answers.repository
        },
        bugs: {
            url: answers.backgroundImage
        },
        license: {
            type: answers.license,
            url: answers.licenseUrl,
            year: new Date().getFullYear()
        },
        options: {
            useVagrant: answers.useVagrant,
            webserver: answers.webserver,
            website: answers.website,
            php: answers.php,
            database: answers.database,
            phpmyadmin: answers.phpmyadmin,
            supportTravis: answers.supportTravis,
            vagrantUp: answers.vagrantUp,
            runInstall: answers.runInstall
        }
    };
}


// scaffold the project
function scaffold (data, done) {
    gulp.src([
            templates + '/**/*',
            ( data.options.supportTravis ? '' : '!' + templates + '/.travis.yml' )
        ], {dot: true})
        .pipe(g.template(data))
        .pipe(g.conflict(cwd + '/'))
        .pipe(gulp.dest(cwd + '/'))
        .pipe(g.if(
            data.options.runInstall,
            g.install({ignoreScripts: true})
        ))
        .on('end', function () {
            done();
        });
}


// the actual gulp task
gulp.task('default', function (done) {
    if (params.silent) {
        var data = parseAnswers({
                authorName: defaultOptions.author.name,
                authorEmail: defaultOptions.author.email,
                authorUrl: defaultOptions.author.url,
                githubUser: defaultOptions.author.githubUser,
                projectName: defaultOptions.project.name,
                projectDescription: '',
                projectVersion: defaultOptions.project.version,
                license: defaultOptions.project.license,
                licenseUrl: getLicenseUrl(defaultOptions.project.license),
                repository: getGithubUrl(defaultOptions.author.githubUser, defaultOptions.project.name),
                bugs: getGithubUrl(defaultOptions.author.githubUser, defaultOptions.project.name, 'issues'),
                useVagrant: defaultOptions.options.useVagrant,
                webserver: defaultOptions.options.webserver,
                website: defaultOptions.options.website,
                php: defaultOptions.options.php,
                database: defaultOptions.options.database,
                phpmyadmin: defaultOptions.options.phpmyadmin,
                supportTravis: defaultOptions.options.supportTravis,
                vagrantUp: defaultOptions.options.vagrantUp,
                runInstall: defaultOptions.options.runInstall
            });
        scaffold(data, done);
    }
    else {
        inquirer.prompt(prompts, function (answers) {
            if (!answers.moveon) {
                return done();
            }
            var data = parseAnswers(answers);
            if (answers.saveAuthorData) {
                fs.writeFileSync(savedDataFile, ini.stringify({author: data.author}))
            }
            scaffold(data, done);
        });
    }
});
