#!/bin/bash
cd ./back-end
echo "Starting back-end"
mkdir data
npm start &
cd ..
cd ./front-end
echo "Starting front-end"
lite-server &
cd ..
python3 ./py_imgProcessing/bottle_server.py &
echo "FrontEnd, BackEnd and ImageManipulation Servers have been started."
echo "To conclude start-up, please enter:"
echo "sudo bash ./py_filesServer/start_py_filesServer.sh"

