PROVISION_MYSQL_ROOTPWD="vagrant"
PROVISION_MYSQL_USER="dev"
PROVISION_MYSQL_PWD="dev"
PROVISION_MYSQL_DB="dev"

debconf-set-selections <<< "mysql-server mysql-server/root_password password $PROVISION_MYSQL_ROOTPWD"
debconf-set-selections <<< "mysql-server mysql-server/root_password_again password $PROVISION_MYSQL_ROOTPWD"

install_packages mysql-server

mysql -uroot -p$PROVISION_MYSQL_ROOTPWD -e "CREATE USER '$PROVISION_MYSQL_USER'@'%' IDENTIFIED BY '$PROVISION_MYSQL_PWD';"
mysql -uroot -p$PROVISION_MYSQL_ROOTPWD -e "CREATE DATABASE IF NOT EXISTS $PROVISION_MYSQL_DB CHARACTER SET utf8 COLLATE utf8_general_ci;"
mysql -uroot -p$PROVISION_MYSQL_ROOTPWD -e "GRANT ALL PRIVILEGES ON $PROVISION_MYSQL_DB.* TO '$PROVISION_MYSQL_USER'@'%' IDENTIFIED BY '$PROVISION_MYSQL_PWD'; FLUSH PRIVILEGES;"
