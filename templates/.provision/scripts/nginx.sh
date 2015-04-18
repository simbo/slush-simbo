install_packages nginx

copy_file /etc/nginx/nginx.conf
copy_file /etc/nginx/sites-available/vagrant<% if (php) { %>
copy_file /etc/nginx/conf.d/php.conf<% } %><% if (phpmyadmin) { %>
copy_file /etc/nginx/conf.d/phpmyadmin.conf<% } %>

rm -f /etc/nginx/sites-enabled/default
ln -s /etc/nginx/sites-available/vagrant /etc/nginx/sites-enabled/vagrant

service nginx restart
