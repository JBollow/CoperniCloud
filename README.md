# Copernicloud
![Travis CI](https://travis-ci.org/JBollow/Geosoftware-2.svg?branch=master)


## A Node app built with AngularJS

Copernicloud is a simple web interface to view and edit Sentinel-2 satellite imagery (Levels 1C and 2A).


# Front-End

## Requirements

- [Node and npm](http://nodejs.org)
- [Python 3.6^](http://python.org)

## Installation

1. Clone the repository: `git clone git@github.com:JBollow/Geosoftware-2.git`
2. Install the application: `npm install`
3. Start the server: `npm start`
4. View in browser at `http://localhost:10001`



# Back-End

## Requirements

- nodemon: `npm install -g nodemon`

- python 3.5.x oder höher
- gdal 2.1 oder höher

- python gdal: `pip install GDAL`
- numpy: `pip install numpy`
- bottle: `pip install bottle`

## Installation

1. Install the server: `npm install`
2. Start the server: `nodemon app`
3. Start the Python Bottle server: `python bottle_server.py`


## Authors
[Anna Formaniuk](https://github.com/annaformaniuk)
[Daniela Heines](https://github.com/Daniela134)
[Sebastian Holtkamp](https://github.com/sholtkamp) 
[Timm Kühnel](https://github.com/Timmimim)
[Jan-Patrick Bollow](https://github.com/JBollow)

## License

MIT License

Copyright (c) 2018 CoperniCloud Team
