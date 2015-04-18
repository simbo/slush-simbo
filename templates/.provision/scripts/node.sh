echo "Installing nvm..."
git clone https://github.com/creationix/nvm.git ~/.nvm && cd ~/.nvm && git checkout `git describe --abbrev=0 --tags` && cd ~
source ~/.nvm/nvm.sh

echo "Installing node.js..."
nvm install 0.12 &> /dev/null
nvm alias default 0.12

echo "Updating npm... (please be patient)"
npm install -g npm@latest

echo "Installing global node packages... (please be patient)"
#npm install -g gulp<% if (bower) { %> bower<% } %>
