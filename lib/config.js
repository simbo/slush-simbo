/**
 * Inquirer dialog prompts
 */

'use strict';


// required modules
var chalk        = require('chalk'),
    path         = require('path'),
    childProcess = require('child_process');


module.exports = function (generator) {

    var childProcessOptions = {
        stdio: 'inherit',
        cwd: generator.cwd
    };

    return {


        // author full name
        authorName: {
            default: function () {
                if (generator.gitconfig.hasOwnProperty('user') && generator.gitconfig.user.name) {
                    return generator.gitconfig.user.name;
                }
                return path.basename(generator.homePath);
            },
            global: true,
            prompt: {
                when: function (answers) {
                    return generator.getSavedOption('authorName')===null || !answers.useSavedOptions;
                },
                message: 'What is the ' + chalk.yellow('author\'s name') + '?'
            }
        },


        // author email address
        authorEmail: {
            default: function () {
                if (generator.gitconfig.hasOwnProperty('user') && generator.gitconfig.user.email) {
                    return generator.gitconfig.user.email;
                }
                return '';
            },
            global: true,
            prompt: {
                when: function (answers) {
                    return generator.getSavedOption('authorEmail')===null || !answers.useSavedOptions;
                },
                message: 'What is the ' + chalk.yellow('author\'s email') + '?'
            }
        },


        // author website url
        authorUrl: {
            default: '',
            global: true,
            prompt: {
                when: function (answers) {
                    return generator.getSavedOption('authorUrl')===null || !answers.useSavedOptions;
                },
                message: 'What is the ' + chalk.yellow('author\'s website') + '?'
            }
        },


        // author github user name
        authorGithubUser: {
            default: function () {
                return path.basename(generator.homePath);
            },
            global: true,
            prompt: {
                when: function (answers) {
                    return generator.getSavedOption('githubUser')===null || !answers.useSavedOptions;
                },
                message: 'What is the ' + chalk.yellow('GitHub username') + '?'
            }
        },


        saveAuthorData: {
            default: true,
            prompt: {
                type: 'confirm',
                when: function (answers) {
                    return !generator.savedOptionsExist() || !answers.useSavedOptions;
                },
                message: 'Do you want to ' + chalk.yellow('save author information') + ' for future project scaffolding?'
            },
            afterScaffolding: function() {
                if (generator.answers.saveAuthorData) {
                    generator.saveOptions();
                }
            }
        },


        // project name
        projectName: {
            default: function () {
                return path.basename(generator.cwd);
            },
            prompt: {
                message: 'What is the ' + chalk.yellow('name') + ' of your project?'
            }
        },


        // project description
        projectDescription: {
            default: '',
            prompt: {
                message: 'What is the ' + chalk.yellow('description') + ' of your project?'
            }
        },


        // project version
        projectVersion: {
            default: '0.1.0',
            prompt: {
                message: 'What is the ' + chalk.yellow('version') + ' of your project?'
            }
        },


        // project license type
        projectLicenseType: {
            default: 'MIT',
            prompt: {
                message: 'What ' + chalk.yellow('license') + ' do you want to use for your project?'
            }
        },


        // project license year
        projectLicenseYear: {
            default: function () {
                return new Date().getFullYear();
            }
        },

        projectLicenseUrl: {
            default: function (licenseType, githubUser) {
                githubUser = githubUser || generator.getDefaultOption('authorGithubUser') || '';
                switch((licenseType || generator._options.projectLicenseType.default).toLowerCase()) {
                    case 'mit':
                        return 'http://' + (githubUser!=='' ? githubUser + '.' : '') + 'mit-license.org/';
                    case 'gpl':
                    case 'gpl3':
                        return 'https://www.gnu.org/licenses/gpl-3.0.txt';
                    case 'gpl2':
                        return 'https://www.gnu.org/licenses/gpl-2.0.txt';
                    default:
                        return '';
                }
            },
            prompt: {
                message: 'What is the ' + chalk.yellow('url for license') + ' information?',
                default: function (answers) {
                    return generator._options.projectLicenseUrl.default(answers.projectLicenseType, answers.authorGithubUser || generator.defaultOptions.authorGithubUser);
                }
            }
        },


        projectRepositoryUrl: {
            default: function (githubUser, projectName, urlType) {
                var types = {
                    repository: '.git',
                    issues: '/issues'
                };
                githubUser = githubUser || generator.defaultOptions.authorGithubUser;
                projectName = projectName || generator.defaultOptions.projectName;
                urlType = Object.keys(types).indexOf(urlType)===-1 ? 'repository' : urlType;
                return 'https://github.com/' + githubUser + '/' + projectName + types[urlType];
            },
            prompt: {
                message: 'What is the url of the project ' + chalk.yellow('repository') + '?',
                default: function(answers) {
                    return generator._options.projectRepositoryUrl.default(answers.authorGithubUser || generator.defaultOptions.authorGithubUser, answers.projectName);
                }
            }
        },


        projectBugtrackerUrl: {
            default: function (githubUser, projectName) {
                return generator._options.projectRepositoryUrl.default(githubUser, projectName, 'issues');
            },
            prompt: {
                message: 'What is the url of the project ' + chalk.yellow('bug tracker') + '?',
                default: function(answers) {
                    return generator._options.projectBugtrackerUrl.default(answers.authorGithubUser || generator.defaultOptions.authorGithubUser, answers.projectName);
                }
            }
        },


        // whether to use vagrant or not
        vagrant: {
            default: false,
            prompt: {
                type: 'confirm',
                message: 'Do you want to use ' + chalk.yellow('Vagrant') + '?'
            }
        },


        // which webserver to use
        webserver: {
            default: 'connect',
            prompt: {
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
            }
        },


        // whether to setup php
        php: {
            default: false,
            prompt: {
                type: 'confirm',
                when: function (answers) {
                    return ['nginx', 'apache'].indexOf(answers.webserver)!==-1;
                },
                message: 'Do want to install ' + chalk.yellow('PHP') + '?'
            }
        },


        // whether to use a database
        database: {
            default: 'none',
            prompt: {
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
                }]
            }
        },


        // whether to use phpmyadmin
        phpmyadmin: {
            default: false,
            prompt: {
                type: 'confirm',
                when: function (answers) {
                    return answers.database==='mysql' && answers.php;
                },
                message: 'Do you want to install ' + chalk.yellow('phpMyAdmin') + '?',
                default: function (answers) {
                    return answers.database==='mysql' && answers.php ? true : generator.defaultOptions.phpmyadmin;
                }
            }
        },


        // which type of website to setup
        website: {
            default: 'html',
            prompt: {
                type: 'list',
                message: 'What kind of basic ' + chalk.yellow('website') + ' do you want to setup?',
                choices: [{
                    name: 'Single HTML file',
                    value: 'html'
                }, {
                    name: 'Metalsmith (static site generator)',
                    value: 'metalsmith'
                }]
            }
        },


        // whether to use bower
        bower: {
            default: false,
            prompt: {
                type: 'confirm',
                message: 'Do you want to add ' + chalk.yellow('Bower') + ' support?'
            }
        },


        // whether to use travis
        travis: {
            default: true,
            prompt: {
                type: 'confirm',
                message: 'Do you want to add ' + chalk.yellow('Travis CI') + ' support?'
            }
        },


        // whether to directly run "vagrant up" after scaffolding
        vagrantUp: {
            default: false,
            prompt: {
                type: 'confirm',
                when: function (answers) {
                    return answers.vagrant;
                },
                message: 'Do you want to run ' + chalk.yellow('vagrant up') + ' after scaffolding?',
                default: function (answers) {
                    return answers.vagrant ? true : generator.defaultOptions.vagrantUp;
                }
            },
            afterScaffolding: function() {
                if (generator.getOption('vagrantUp')) {
                    childProcess.spawnSync('vagrant', ['up'], childProcessOptions);
                }
            }
        },


        // whether to run `npm install` and/or `bower install` directly after scaffolding
        install: {
            default: false,
            prompt: {
                type: 'confirm',
                when: function (answers) {
                    return !answers.vagrant;
                },
                message: function (answers) {
                    var bowerMsg = answers.bower ? ' and bower components' : '';
                    return 'Do you want to ' + chalk.yellow('install') + ' node modules' + bowerMsg + ' after scaffolding?';
                },
                default: function (answers) {
                    return answers.vagrant ? false : generator.defaultOptions.install;
                }
            },
            afterScaffolding: function() {
                if (generator.getOption('install')) {
                    childProcess.spawnSync('npm', ['install'], childProcessOptions);
                }
            }
        }


    };

}
