install_packages nginx

copy_file /etc/nginx/nginx.conf
copy_file /etc/nginx/sites-available/vagrant
copy_file /etc/nginx/conf.d/deny.conf
copy_file /etc/nginx/conf.d/expires.conf
copy_file /etc/nginx/conf.d/favicon.conf
copy_file /etc/nginx/conf.d/gzip.conf
copy_file /etc/nginx/conf.d/robots.conf<% if (php) { %>
copy_file /etc/nginx/conf.d/php.conf<% } %><% if (phpmyadmin) { %>
copy_file /etc/nginx/conf.d/phpmyadmin.conf<% } %>

rm -f /etc/nginx/sites-enabled/default
ln -s /etc/nginx/sites-available/vagrant /etc/nginx/sites-enabled/vagrant

service nginx restart
