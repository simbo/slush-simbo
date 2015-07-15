/**
 * Template sources list, depending on conditions
 */

'use strict';


module.exports = function(generator) {

    var sources = [],
        options = generator.options,
        templates = [{
                condition: true,
                sources: [
                    '.editorconfig',
                    '.gitignore',
                    'GulpConfig.js',
                    'Gulpfile.js',
                    'LICENSE',
                    'package.json',
                    'README.md'
                ]
            }, {
                condition: options.vagrant,
                sources: [
                    'Vagrantfile',
                    '.provision/provision.sh',
                    '.provision/scripts/functions.sh',
                    '.provision/scripts/node.sh'
                ]
            }, {
                condition: options.vagrant && options.webserver==='nginx',
                sources: [
                    '.provision/scripts/nginx.sh',
                    '.provision/files/etc/nginx/nginx.conf',
                    '.provision/files/etc/nginx/sites-available/vagrant'
                ]
            }, {
                condition: options.vagrant && options.webserver==='apache',
                sources: [
                    '.provision/scripts/apache.sh',
                    '.provision/files/etc/apache2/**/*'
                ]
            }, {
                condition: options.vagrant && options.database==='mysql',
                sources: '.provision/scripts/mysql.sh'
            }, {
                condition: options.vagrant && options.php,
                sources: [
                    '.provision/scripts/php.sh',
                    '.provision/files/etc/php5/cli/conf.d/01-php.ini',
                    '.provision/files/etc/php5/fpm/conf.d/00-php.ini',
                    '.provision/files/etc/php5/fpm/pool.d/vagrant.conf'
                ]
            }, {
                condition: options.vagrant && options.php && options.webserver==='nginx',
                sources: [
                    '.provision/files/etc/nginx/conf.d/php.conf'
                ]
            }, {
                condition: options.vagrant && options.phpmyadmin,
                sources: [
                    '.provision/scripts/phpmyadmin.sh',
                    '.provision/files/etc/phpmyadmin/config.inc.php'
                ]
            }, {
                condition: options.vagrant && options.phpmyadmin && options.webserver==='nginx',
                sources: [
                    '.provision/files/etc/nginx/conf.d/phpmyadmin.conf'
                ]
            }, {
                condition: options.website==='html',
                sources: [
                    'web/index.html'
                ]
            }, {
                condition: options.bower,
                sources: [
                    '.bowerrc',
                    'bower.json'
                ]
            }, {
                condition: options.travis,
                sources: [
                    '.travis.yml'
                ]
            }];

    templates.forEach(function(template) {
        if (template.condition) {
            sources = sources.concat(template.sources.map(function (source) {
                return generator.templatesPath + '/' + source;
            }));
        }
    });

    return sources;

}
