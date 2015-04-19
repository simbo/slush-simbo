install_packages nginx

copy_file /etc/nginx/nginx.conf
copy_file /etc/nginx/sites-available/vagrant

rm -f /etc/nginx/sites-enabled/default
ln -s /etc/nginx/sites-available/vagrant /etc/nginx/sites-enabled/vagrant

service nginx restart
