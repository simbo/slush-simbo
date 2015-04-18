install_packages() {
    apt-get -y -qq install $*
}

copy_file() {
    SOURCE="$PROVISION_FILES$1"
    TARGET="$1"
    cp -f --remove-destination $SOURCE $TARGET
}

format_duration() {
    ((h=${1}/3600))
    ((m=(${1}%3600)/60))
    ((s=${1}%60))
    printf "%02d:%02d:%02d\n" $h $m $s
}
