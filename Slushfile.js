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
    chalk        = require('chalk'),
    childProcess = require('child_process'),
    fs           = require('fs'),
    gulp         = require('gulp'),
    ini          = require('ini'),
    inquirer     = require('inquirer'),
    minimist     = require('minimist'),
    path         = require('path'),
    util         = require('util');


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
            authorName: path.basename(home),
            authorEmail: '',
            authorUrl: '',
            authorGithubUser: path.basename(home),
            projectName: path.basename(cwd),
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
        if (!savedData) {
            var gitconfig = path.join(home, '.gitconfig');
            if (fs.existsSync(gitconfig)) {
                var gitconfigData = ini.parse(fs.readFileSync(gitconfig, 'utf-8'));
                options.authorName = gitconfigData.user.name;
                options.authorEmail = gitconfigData.user.email;
            }
        }
        else {
            options.authorName = savedData.authorName;
            options.authorEmail = savedData.authorEmail;
            options.authorUrl = savedData.authorUrl;
            options.authorGithubUser = savedData.authorGithubUser;
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
        name: 'vagrant',
        type: 'confirm',
        message: 'Do you want to use ' + chalk.yellow('Vagrant') + '?',
        default: defaultOptions.vagrant
    }, {
        name: 'webserver',
        type: 'list',
        when: function (answers) {
            return answers.vagrant;
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
        default: function (answers) {
            return answers.vagrant ? 'nginx' : defaultOptions.webserver
        }
    }, {
        name: 'php',
        type: 'confirm',
        when: function (answers) {
            return ['nginx', 'apache'].indexOf(answers.webserver)!==-1;
        },
        message: 'Do want to install ' + chalk.yellow('PHP') + '?',
        default: defaultOptions.php
    }, {
        name: 'database',
        type: 'list',
        when: function (answers) {
            return answers.vagrant;
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
        default: defaultOptions.database
    }, {
        name: 'phpmyadmin',
        type: 'confirm',
        when: function (answers) {
            return answers.database==='mysql' && answers.php;
        },
        message: 'Do you want to install ' + chalk.yellow('phpMyAdmin') + '?',
        default: function (answers) {
            return answers.database==='mysql' && answers.php ? true : defaultOptions.phpmyadmin;
        }
    }, {
        name: 'website',
        type: 'list',
        message: 'What kind of basic ' + chalk.yellow('website') + ' do you want to setup?',
        choices: [{
            name: 'Single HTML file',
            value: 'html'
        }, {
            name: 'Metalsmith (static site generator)',
            value: 'metalsmith'
        }],
        default: defaultOptions.website
    }, {
        name: 'bower',
        type: 'confirm',
        message: 'Do you want to add ' + chalk.yellow('Bower') + ' support?',
        default: defaultOptions.bower
    }, {
        name: 'travis',
        type: 'confirm',
        message: 'Do you want to add ' + chalk.yellow('Travis CI') + ' support?',
        default: defaultOptions.travis
    }, {
        name: 'vagrantUp',
        type: 'confirm',
        when: function (answers) {
            return answers.vagrant;
        },
        message: 'Do you want to run ' + chalk.yellow('vagrant up') + ' after scaffolding?',
        default: function (answers) {
            return answers.vagrant ? true : defaultOptions.vagrantUp;
        }
    }, {
        name: 'install',
        type: 'confirm',
        when: function (answers) {
            return !answers.vagrant;
        },
        message: function (answers) {
            var bowerMsg = answers.bower ? ' and bower components' : '';
            return 'Do you want to ' + chalk.yellow('install') + ' npm modules' + bowerMsg + ' after scaffolding?';
        },
        default: function (answers) {
            return answers.vagrant ? false : defaultOptions.install;
        }
    }, {
        name: 'continue',
        type: 'confirm',
        message: 'Please check your answers. ' + chalk.yellow('Continue') + '?',
        default: true
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
function getOptions (answers) {
    var options = _.merge({}, defaultOptions, answers || {});
    if (savedData && options.useSavedAuthorData) {
        options = _.merge(options, savedData);
    }
    options.projectLicenseYear = new Date().getFullYear();
    return options;
}


// combine template sources depending on options
function getTemplateSources (options) {
    var sources = [
            '.editorconfig',
            '.gitignore',
            'GulpConfig.js',
            'Gulpfile.js',
            'LICENSE',
            'package.json',
            'README.md'
        ];
    if (options.vagrant) {
        sources.push(
            'Vagrantfile',
            '.provision/provision.sh',
            '.provision/scripts/functions.sh',
            '.provision/scripts/node.sh'
        );
        if (options.webserver==='nginx') {
            sources.push(
                '.provision/scripts/nginx.sh',
                '.provision/files/etc/nginx/nginx.conf',
                '.provision/files/etc/nginx/sites-available/vagrant'
            );
            if (options.php) {
                sources.push('.provision/files/etc/nginx/conf.d/php.conf');
            }
            if (options.phpmyadmin) {
                sources.push('.provision/files/etc/nginx/conf.d/phpmyadmin.conf');
            }
        }
        else if (options.webserver==='apache') {
            sources.push(
                '.provision/scripts/apache.sh',
                '.provision/files/etc/apache2/**/*'
            );
        }
        if (options.database==='mysql') {
            sources.push('.provision/scripts/mysql.sh');
        }
        if (options.php) {
            sources.push(
                '.provision/scripts/php.sh',
                '.provision/files/etc/php5/cli/conf.d/01-php.ini',
                '.provision/files/etc/php5/fpm/conf.d/00-php.ini',
                '.provision/files/etc/php5/fpm/conf.d/06-opcache.ini',
                '.provision/files/etc/php5/fpm/pool.d/vagrant.conf'
            );
        }
        if (options.phpmyadmin) {
            sources.push('.provision/scripts/phpmyadmin.sh');
        }
    }
    if (options.bower) {
        sources.push(
            '.bowerrc',
            'bower.json'
        );
    }
    if (options.travis) {
        sources.push('.travis.yml');
    }
    return sources.map(function (source) {
        return templates + '/' + source;
    });
}


// scaffold the project
function scaffold (options, done) {
    var childProcessOptions = {
        stdio: 'inherit',
        cwd: cwd
    };
    gulp.src(getTemplateSources(options), {
            dot: true,
            base: templates
        })
        .pipe(g.template(options))
        .pipe(g.conflict(cwd + '/'))
        .pipe(gulp.dest(cwd + '/'))
        .on('end', function () {
            if (options.install) {
                childProcess.spawnSync('npm', ['install'], childProcessOptions);
            }
            if (options.vagrantUp) {
                childProcess.spawnSync('vagrant', ['up'], childProcessOptions);
            }
            done();
        });
}


// the actual gulp task
gulp.task('default', function (done) {
    if (params.silent) {
        var options = getOptions();
        options.projectLicenseUrl = getLicenseUrl(defaultOptions.projectLicenseType);
        options.projectRepositoryUrl = getGithubUrl(defaultOptions.authorGithubUser, defaultOptions.projectName);
        options.projectBugtrackerUrl = getGithubUrl(defaultOptions.authorGithubUser, defaultOptions.projectName, 'issues');
        scaffold(options, done);
    }
    else {
        inquirer.prompt(prompts, function (answers) {
            if (!answers.continue) {
                return done();
            }
            var options = getOptions(answers);
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
