#!/bin/bash
echo "Starting Tilesserver"
cd /opt/
sudo python3 -m http.server 443 >/dev/null 2>&1 & #
cd /home/t_kueh06/copernicloud/Geosoftware-2/back-end
echo "Starting back-end"
npm start &
cd /home/t_kueh06/copernicloud/Geosoftware-2/front-end
echo "Starting front-end"
lite-server &
cd /home/t_kueh06/copernicloud/Geosoftware-2/py_imgProcessing
echo "Starting py_imgProcessing"
sudo python3 bottle_server.py &
cd /home/t_kueh06/
echo "Starting mongodDB"
sudo mongod --dbpath=/home/t_kueh06/mongoDB_data/ >/dev/null 2>&1 & #
echo "FrontEnd, BackEnd and ImageManipulation Servers have been started."