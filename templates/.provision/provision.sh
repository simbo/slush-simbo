# vars
PROVISION_STARTED=`date +%s`
PROVISION_BASEDIR="/vagrant/.provision"
PROVISION_FILES="$PROVISION_BASEDIR/files"
PROVISION_SCRIPTS="$PROVISION_BASEDIR/scripts"
PROVISIONED="~/.provisioned"

# start provisioning
echo "Starting provisioning..."

# test if machine is already provisioned
if [[ -f $PROVISIONED ]]; then
    echo "Skipping provisioning. (already provisioned on $(cat $PROVISIONED))"
    exit
fi

# update sources, upgrade packages
sudo apt-get -y update
sudo apt-get -y upgrade

# scripts
source $PROVISION_SCRIPTS/nginx.sh
source $PROVISION_SCRIPTS/apache.sh
source $PROVISION_SCRIPTS/mysql.sh
source $PROVISION_SCRIPTS/php.sh
source $PROVISION_SCRIPTS/nvm.sh

# write provision date to file to avoid reprovisioning
echo "$(date)" > $PROVISIONED

# print provision duration
PROVISION_DURATION=$((`date +%s`-$PROVISION_STARTED))
format_duration() {
    ((h=${1}/3600))
    ((m=(${1}%3600)/60))
    ((s=${1}%60))
    printf "%02d:%02d:%02d\n" $h $m $s
}
echo "Provisioning done after $(format_duration $PROVISION_DURATION)."
