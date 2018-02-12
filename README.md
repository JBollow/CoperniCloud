# CoperniCloud
[![Build Status](https://travis-ci.org/JBollow/Geosoftware-2.svg?branch=master)](https://travis-ci.org/JBollow/Geosoftware-2)


## A Node app built with AngularJS

CoperniCloud is a simple web interface to view and edit Sentinel-2 satellite imagery (Levels 1C and 2A).
The web application is written in `AngularJS`, while the server logic is implemented in `NodeJS`.

Image manipulation is done using a second server, implemented in `Python`, using the `bottle` framework.

All satellite data is supplied for visualization using a simple TMS, and visualised on the web interface using the `Leaflet` framework.

## Important note for this branch
This is a special deployment branch, created and organized specifically 
to deploy the **CoperniCloud** platform on a `Ubuntu 16.4LTS xenial` -based `Docker` container.

# Front-End

## Requirements

- [Node and npm](http://nodejs.org)
- Globally installed instance of `lite-server`: `$ sudo npm i -g lite-server`

## Installation

0. Clone the repository: `$ git clone git@github.com:JBollow/Geosoftware-2.git`
1. Install the application: `$ npm install`
2. Start the server: `$ liteserver`
3. View in browser at `http://localhost:8080/`


# Back-End

## Requirements

- **nodemon**: `$ npm install -g nodemon`


- [Python](http://python.org) v3.5 or higher
- [GDAL](http://gdal.org) v2.1 or higher
- [MongoDB](https://www.mongodb.com/) v2.6 or higher (running on port `27017`)

- **python http**: `$ sudo pip3 install request && sudo pip3 install http`
- **python-gdal**: `$ sudo apt install python3-gdal`
- **numpy**: `$ sudo pip install numpy`
- **bottle**: `$ sudo pip install bottle`
- **Pillow**: `$ sudo pip install Pillow`  # Pillow is a currently maintained Fork of PIL (Python Image Library)

## Installation

0. Clone the repository: `$ git clone git@github.com:JBollow/Geosoftware-2.git`
1. Install the server: `$ npm install`
2. Start the server: `$ nodemon app`
3. Start the Python Bottle server: `$ python3 bottle_server.py`
4. Start the Python FileServer for Tile Delivery: `$ sudo bash ./py_filesServer/start_f`


## Authors
[Anna Formaniuk](https://github.com/annaformaniuk)

[Daniela Heines](https://github.com/Daniela134)

[Sebastian Holtkamp](https://github.com/sholtkamp)

[Timm Kühnel](https://github.com/Timmimim)

[Jan-Patrick Bollow](https://github.com/JBollow)

## License

MIT License

Copyright (c) 2018 CoperniCloud Team
