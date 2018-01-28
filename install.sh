#!/bin/bash
cd ./back-end
echo "Installing back-end"
npm install
cd ..
cd ./front-end
echo "Installing front-end"
npm install
cd ..