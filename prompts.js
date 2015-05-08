/**
 * Inquirer dialog prompts
 */

'use strict';


// required modules
var chalk = require('chalk');


module.exports = function (generator) {

    var prompts = [{
            name: 'useSavedAuthorData',
            type: 'confirm',
            when: function (answers) {
                return generator.savedData ? true : false;
            },
            message: function (answers) {
                return 'Use this as author data?' +
                    chalk.reset.gray('\nName: ') + chalk.yellow(generator.savedData.authorName) +
                    chalk.reset.gray('\nE-Mail: ') + chalk.yellow(generator.savedData.authorEmail) +
                    chalk.reset.gray('\nURL: ') + chalk.yellow(generator.savedData.authorUrl) +
                    chalk.reset.gray('\nGitHub User: ') + chalk.yellow(generator.savedData.authorGithubUser) +
                    '\n';
            }
        }, {
            name: 'authorName',
            when: function (answers) {
                return !generator.savedData || !answers.useSavedAuthorData;
            },
            message: 'What is the ' + chalk.yellow('author\'s name') + '?',
            default: generator.defaultOptions.authorName
        }, {
            name: 'authorEmail',
            when: function (answers) {
                return !generator.savedData || !answers.useSavedAuthorData;
            },
            message: 'What is the ' + chalk.yellow('author\'s email') + '?',
            default: generator.defaultOptions.authorEmail
        }, {
            name: 'authorUrl',
            when: function (answers) {
                return !generator.savedData || !answers.useSavedAuthorData;
            },
            message: 'What is the ' + chalk.yellow('author\'s website') + '?',
            default: generator.defaultOptions.authorUrl
        }, {
            name: 'authorGithubUser',
            when: function (answers) {
                return !generator.savedData || !answers.useSavedAuthorData;
            },
            message: 'What is the ' + chalk.yellow('GitHub username') + '?',
            default: generator.defaultOptions.authorGithubUser
        }, {
            name: 'saveAuthorData',
            type: 'confirm',
            when: function (answers) {
                return !generator.savedData || !answers.useSavedAuthorData;
            },
            message: 'Do you want to ' + chalk.yellow('save author information') + ' for future project scaffolding?',
            default: true
        }, {
            name: 'projectName',
            message: 'What is the ' + chalk.yellow('name') + ' of your project?',
            default: generator.defaultOptions.projectName
        }, {
            name: 'projectDescription',
            message: 'What is the ' + chalk.yellow('description') + ' of your project?',
            default: generator.defaultOptions.projectDescription
        }, {
            name: 'projectVersion',
            message: 'What is the ' + chalk.yellow('version') + ' of your project?',
            default: generator.defaultOptions.projectVersion
        }, {
            name: 'projectLicenseType',
            message: 'What ' + chalk.yellow('license') + ' do you want to use for your project?',
            default: generator.defaultOptions.projectLicenseType
        }, {
            name: 'projectLicenseUrl',
            message: 'What is the ' + chalk.yellow('url for license') + ' information?',
            default: function (answers) {
                return generator.getLicenseUrl(answers.projectLicenseType);
            }
        }, {
            name: 'projectRepositoryUrl',
            message: 'What is the url of the project ' + chalk.yellow('repository') + '?',
            default: function (answers) {
                var githubUser = generator.savedData.authorGithubUser || generator.defaultOptions.authorGithubUser || answers.authorGithubUser;
                return githubUser ? generator.getGithubUrl(githubUser, answers.projectName) : '';
            }
        }, {
            name: 'projectBugtrackerUrl',
            message: 'What is the url of the project ' + chalk.yellow('bug tracker') + '?',
            default: function (answers) {
                var githubUser = generator.savedData.authorGithubUser || generator.defaultOptions.authorGithubUser || answers.authorGithubUser;
                return githubUser ? generator.getGithubUrl(githubUser, answers.projectName, 'issues') : '';
            }
        }, {
            name: 'vagrant',
            type: 'confirm',
            message: 'Do you want to use ' + chalk.yellow('Vagrant') + '?',
            default: generator.defaultOptions.vagrant
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
                return answers.vagrant ? 'nginx' : generator.defaultOptions.webserver
            }
        }, {
            name: 'php',
            type: 'confirm',
            when: function (answers) {
                return ['nginx', 'apache'].indexOf(answers.webserver)!==-1;
            },
            message: 'Do want to install ' + chalk.yellow('PHP') + '?',
            default: generator.defaultOptions.php
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
            default: generator.defaultOptions.database
        }, {
            name: 'phpmyadmin',
            type: 'confirm',
            when: function (answers) {
                return answers.database==='mysql' && answers.php;
            },
            message: 'Do you want to install ' + chalk.yellow('phpMyAdmin') + '?',
            default: function (answers) {
                return answers.database==='mysql' && answers.php ? true : generator.defaultOptions.phpmyadmin;
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
            default: generator.defaultOptions.website
        }, {
            name: 'bower',
            type: 'confirm',
            message: 'Do you want to add ' + chalk.yellow('Bower') + ' support?',
            default: generator.defaultOptions.bower
        }, {
            name: 'travis',
            type: 'confirm',
            message: 'Do you want to add ' + chalk.yellow('Travis CI') + ' support?',
            default: generator.defaultOptions.travis
        }, {
            name: 'vagrantUp',
            type: 'confirm',
            when: function (answers) {
                return answers.vagrant;
            },
            message: 'Do you want to run ' + chalk.yellow('vagrant up') + ' after scaffolding?',
            default: function (answers) {
                return answers.vagrant ? true : generator.defaultOptions.vagrantUp;
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
                return answers.vagrant ? false : generator.defaultOptions.install;
            }
        }, {
            name: 'continue',
            type: 'confirm',
            message: 'Please check your answers. ' + chalk.yellow('Continue') + '?',
            default: true
        }];

    return prompts;

}
