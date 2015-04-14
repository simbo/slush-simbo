
sudo apt-get -y install nginx
sudo cp -R $PROVISION_FILES/etc/nginx/* /etc/nginx
sudo rm /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/vagrant /etc/nginx/sites-enabled/vagrant
sudo service nginx restart
