/**
 * slush-simbo-project
 * ===================
 * https://github.com/simbo/slush-simbo-project
 *
 * Copyright © 2015 Simon Lepel <simbo@simbo.de>
 * Licensed under the MIT license.
 */

'use strict';

var autoPlug = require('auto-plug'),
    chalk = require('chalk'),
    fs = require('fs'),
    gulp = require('gulp'),
    ini = require('ini'),
    inquirer = require('inquirer'),
    minimist = require('minimist'),
    path = require('path'),
    util = require('util'),

    cwd = process.cwd(),
    pkgDir = __dirname,
    pkgJson = require(path.join(pkgDir, 'package.json')),
    home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE,
    templates = path.join(pkgDir, 'templates'),
    savedDataFile = path.join(home, '.' + pkgJson.name),
    savedDataFileExists = fs.existsSync(savedDataFile),
    savedData = savedDataFileExists ? ini.parse(fs.readFileSync(savedDataFile, 'utf-8')) : {},

    g = autoPlug({ prefix: 'gulp', config: pkgJson }),

    params = (function () {
        var cliParams = minimist(process.argv.slice(3)),
            params = {
                silent: cliParams.silent===true || cliParams.s===true || cliParams.S===true || false
            };
        return params;
    })(),

    defaultOptions = (function () {
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
    })(),

    prompts = [{
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
        message: 'What is the author\'s name?',
        default: defaultOptions.author.name
    }, {
        when: function (answers) {
            return !savedDataFileExists || !answers.useSavedAuthorData;
        },
        name: 'authorEmail',
        message: 'What is the author\'s email?',
        default: defaultOptions.author.email
    }, {
        when: function (answers) {
            return !savedDataFileExists || !answers.useSavedAuthorData;
        },
        name: 'authorUrl',
        message: 'What is the author\'s website?',
        default: defaultOptions.author.url
    }, {
        when: function (answers) {
            return !savedDataFileExists || !answers.useSavedAuthorData;
        },
        name: 'githubUser',
        message: 'What is the github username?',
        default: defaultOptions.author.githubUser
    }, {
        when: function (answers) {
            return !savedDataFileExists || !answers.useSavedAuthorData;
        },
        name: 'saveAuthorData',
        type: 'confirm',
        message: 'Save author information for future project scaffolding?'
    }, {
        name: 'projectName',
        message: 'What is the name of your project?',
        default: defaultOptions.project.name
    }, {
        name: 'projectDescription',
        message: 'What is the description of your project?',
    }, {
        name: 'projectVersion',
        message: 'What is the version of your project?',
        default: defaultOptions.project.version
    }, {
        name: 'license',
        message: 'What license do you want to use for your project?',
        default: 'MIT'
    }, {
        name: 'licenseUrl',
        message: 'What is the url for license information?',
        default: function (answers) {
            return getLicenseUrl(answers.license.toLowerCase());
        }
    }, {
        name: 'repository',
        message: 'What is the url of the project repository?',
        default: function (answers) {
            var githubUser = savedData.githubUser || defaultOptions.author.githubUser || answers.githubUser;
            if (githubUser) {
                return getGithubRepositoryUrl(githubUser, answers.projectName);
            }
            return '';
        }
    }, {
        name: 'bugs',
        message: 'What is the url of the project\'s bug tracker?',
        default: function (answers) {
            var githubUser = savedData.githubUser || defaultOptions.author.githubUser || answers.githubUser;
            if (githubUser) {
                return getGithubIssuesUrl(githubUser, answers.projectName);
            }
            return '';
        }
    }, {
        type: 'confirm',
        name: 'runInstall',
        message: 'Do you want to install npm and bower packages after scaffolding?',
        default: defaultOptions.options.runInstall
    }, {
        type: 'confirm',
        name: 'moveon',
        message: 'Continue?'
    }];

function getGithubRepositoryUrl (user, project) {
    return 'git://github.com/' + user + '/' + project + '.git';
}

function getGithubIssuesUrl (user, project) {
    return 'https://github.com/' + user + '/' + project + '/issues';
}

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
            runInstall: answers.runInstall
        }
    };
}

function scaffold (data, done) {
    gulp.src(templates + '/**/*', {dot: true})
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
                repository: getGithubRepositoryUrl(defaultOptions.author.githubUser, defaultOptions.project.name),
                bugs: getGithubIssuesUrl(defaultOptions.author.githubUser, defaultOptions.project.name),
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
