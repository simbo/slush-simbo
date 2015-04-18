# vars
PROVISION_STARTED=`date +%s`
PROVISION_BASEDIR="/vagrant/.provision"
PROVISION_FILES="$PROVISION_BASEDIR/files"
PROVISION_SCRIPTS="$PROVISION_BASEDIR/scripts"
PROVISIONED="/home/vagrant/.provisioned"

# functions
source $PROVISION_SCRIPTS/functions.sh

# start provisioning
echo "Starting provisioning..."

# test if machine is already provisioned
if [[ -f $PROVISIONED ]]; then
    echo "Skipping provisioning. (already provisioned on $(cat $PROVISIONED))"
    exit 0
fi

# update sources, upgrade packages
apt-get -y -qq update
apt-get -y -qq upgrade

# scripts<% if (webserver==='nginx') { %>
source $PROVISION_SCRIPTS/nginx.sh<% } %><% if (webserver==='apache') { %>
source $PROVISION_SCRIPTS/apache.sh<% } %><% if (database==='mysql') { %>
source $PROVISION_SCRIPTS/mysql.sh<% } %><% if (php) { %>
source $PROVISION_SCRIPTS/php.sh<% } %>
su vagrant -c "source $PROVISION_SCRIPTS/node.sh"

# cleanup
apt-get -y -qq autoremove
apt-get -y -qq clean

# write provision date to file to avoid reprovisioning
su vagrant -c "touch $PROVISIONED"
echo "$(date)" > $PROVISIONED

# print provision duration
PROVISION_DURATION=$((`date +%s`-$PROVISION_STARTED))
echo "Provisioning done after $(format_duration $PROVISION_DURATION)."
