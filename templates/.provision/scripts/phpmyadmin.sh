PROVISION_PHPMYADMIN_PWD="vagrant"

add-apt-repository -y ppa:nijel/phpmyadmin
apt-get -y -qq update

debconf-set-selections <<< "phpmyadmin phpmyadmin/dbconfig-install boolean true"
debconf-set-selections <<< "phpmyadmin phpmyadmin/mysql/admin-user string root"
debconf-set-selections <<< "phpmyadmin phpmyadmin/mysql/admin-pass password $PROVISION_MYSQL_ROOTPWD"
debconf-set-selections <<< "phpmyadmin phpmyadmin/mysql/app-pass password $PROVISION_PHPMYADMIN_PWD"
debconf-set-selections <<< "phpmyadmin phpmyadmin/app-password-confirm password $PROVISION_PHPMYADMIN_PWD"
debconf-set-selections <<< "phpmyadmin phpmyadmin/reconfigure-webserver multiselect none"

install_packages phpmyadmin
copy_file /etc/phpmyadmin/config.inc.php
<% if (webserver==='nginx') { %>
copy_file /etc/nginx/conf.d/phpmyadmin.conf<% } else if (webserver==='apache') { %>
<% } %>
<% if (webserver==='nginx') { %>
sudo service nginx restart<% } else if (webserver==='apache') { %>
sudo service apache2 restart<% } %>
