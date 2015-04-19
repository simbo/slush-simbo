install_packages php5-fpm php5 php5-cli php5-curl php5-gd php5-json php5-mcrypt php5-xdebug php5-xsl php5-imagick php5-intl<% if (database==='mysql') { %> php5-mysql<% } %>

copy_file /etc/php5/cli/conf.d/01-php.ini
copy_file /etc/php5/fpm/conf.d/00-php.ini
copy_file /etc/php5/fpm/pool.d/vagrant.conf<% if (webserver==='nginx') { %>
copy_file /etc/nginx/conf.d/php.conf<% } %>

rm -f /etc/php5/fpm/pool.d/www.conf
php5enmod mcrypt

service php5-fpm restart<% if (webserver==='nginx') { %>
service nginx restart<% } else if (webserver==='apache') { %>
service apache2 restart<% } %>
