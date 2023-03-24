echo Installing everything you need...
if [[ $(which docker) && $(docker --version) ]]; then
   echo Docker установлен, продолжаем...
    else
   curl https://get.docker.com | sh
fi
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker network create traefik-public
echo Enter the desired domain in the format of \"drain.com\":
read domain
sed -i "s/drainer.com/$domain/g" docker-compose.yml
IP=$(curl api.ipify.org)
echo Done! Create an A-type entry in your domain control panel, targeting $IP 
docker-compose up -d
