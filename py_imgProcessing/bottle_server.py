#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue Jan 16 22:03:38 2018

@author: timmimim
"""

from bottle import route, run, template, request, response
import time
import numpy as np
import image_operations as img_ops
import os
from subprocess import Popen
from subprocess import call
import gdal
import gdalconst
import osr
import json
import subprocess
from json import dumps

float32 = np.float32
geotiff = gdal.GetDriverByName('GTiff')

# helper functions to handle Band- and Image requests

# convert incoming band IDs to band file names

# docker
# localPath = ""
# Anna
localPath = "F:/Dokumente/Uni/WS_2017/Geosoft2/Testdaten"
# Jan-Patrick
# localPath = "Y:/OneDrive/Dokumente/Uni/Uni Münster/WS17/Geosoft 2/Projekt/Testdaten"

optPath = localPath + "/opt/"


def getFileNamesPerBandID(imgName):
    img = imgName
    imgPath = optPath + "sentinel2/" + \
        img + ".SAFE/GRANULE/"
    dirName = os.listdir(imgPath)
    print(dirName)
    imgPath = imgPath + dirName[0] + "/IMG_DATA/"

    filenameParts = imgName.split("_")

    bandFileNames = [None]*13

    # helper functions for building band file paths
    def concatenateFileName_2A(bandID):
        if os.path.is_file(imgPath + "R10m/L2A_" + filenameParts[5] + "_" + filenameParts[2] + "_" + bandID + "_10m.jp2"):
            return imgPath + "R10m/L2A_" + filenameParts[5] + "_" + filenameParts[2] + "_" + bandID + "_10m.jp2"
        elif os.path.is_file(imgPath + "R20m/L2A_" + filenameParts[5] + "_" + filenameParts[2] + "_" + bandID + "_20m.jp2"):
            return imgPath + "R20m/L2A_" + filenameParts[5] + "_" + filenameParts[2] + "_" + bandID + "_20m.jp2"
        else:
            return imgPath + "R60m/L2A_" + filenameParts[5] + "_" + filenameParts[2] + "_" + bandID + "_60m.jp2"

    def concatenateFileName_1C(bandID):
        filenamePrefix = filenameParts[5] + "_" + filenameParts[2] + "_"
        return imgPath + filenamePrefix + bandID + ".jp2"

    if "L1C" in filenameParts[1]:
        bandFileNames = [
            concatenateFileName_1C("B01"),
            concatenateFileName_1C("B02"),
            concatenateFileName_1C("B03"),
            concatenateFileName_1C("B04"),
            concatenateFileName_1C("B05"),
            concatenateFileName_1C("B06"),
            concatenateFileName_1C("B07"),
            concatenateFileName_1C("B08"),
            concatenateFileName_1C("B8A"),
            concatenateFileName_1C("B09"),
            concatenateFileName_1C("B10"),
            concatenateFileName_1C("B11"),
            concatenateFileName_1C("B12")
        ]
    else:
        bandFileNames = [
            concatenateFileName_2A("B01"),
            concatenateFileName_2A("B02"),
            concatenateFileName_2A("B03"),
            concatenateFileName_2A("B04"),
            concatenateFileName_2A("B05"),
            concatenateFileName_2A("B06"),
            concatenateFileName_2A("B07"),
            concatenateFileName_2A("B08"),
            concatenateFileName_2A("B8A"),
            concatenateFileName_2A("B09"),
            concatenateFileName_2A("B10"),
            concatenateFileName_2A("B11"),
            concatenateFileName_2A("B12")
        ]

    return bandFileNames


def makeColorInterpretationSettingNumeric(instructions):
    instructionSet = instructions
    if instructionSet['color'] == "grayscale":
        instructionSet['color'] = 1
    if instructionSet['color'] == "palette":
        instructionSet['color'] = 2
    if instructionSet['color'] == "red":
        instructionSet['color'] = 3
    if instructionSet['color'] == "green":
        instructionSet['color'] = 4
    if instructionSet['color'] == "blue":
        instructionSet['color'] = 5
    if instructionSet['color'] == "alpha":
        instructionSet['color'] = 6
    return instructionSet


#######################
######  Server  #######
#######################


@route('/')
def meta(x='NA'):
    return '<b>This is a simple python server, set up using the Bottle framework.</b>'


@route('/create_new_image')
def create_new_image():

    req = request.json
    imageName = req['image']
    tilePath = optPath + "userrequest/" + \
        req['image'] + ".SAFE/" + req['id']
    os.makedirs(tilePath)

    tmpPath = optPath + "tmp/copernicloud/userrequest/" + \
        req['id'] + "/"
    os.makedirs(tmpPath)

    tmpFile = tmpPath + req['id'] + ".tif"

    # get full file paths for each band of the requested image
    bandFileNames = getFileNamesPerBandID(imageName)

    # read one band to get metadata, i.e. GeoTransform and Projection
    metaBand = gdal.Open(bandFileNames[1])

    #newImageObject = geotiff.CreateCopy(tmpFile, metaBand, 0)
    newImageObject = geotiff.Create(
        tmpFile,
        metaBand.RasterXSize, metaBand.RasterYSize,
        len(req['operations']),
        gdal.GDT_UInt16)
    newImageObject.SetGeoTransform(metaBand.GetGeoTransform())
    newImageObject.SetProjection(metaBand.GetProjection())

    bandBuildInstructions = [None]*len(req['operations'])
    for i, instructionSet in enumerate(req['operations'], start=0):
        bandBuildInstructions[i] = makeColorInterpretationSettingNumeric(
            instructionSet)

    summaryArray = []

    for index, instructionSet in enumerate(bandBuildInstructions, start=1):
        newBand = img_ops.edit_band(instructionSet, bandFileNames)

        # summaryStatistics[str(index)] = img_ops.getSummaryStatistics(newBand)
        summaryArray.append(img_ops.getSummaryStatistics(newBand))

        newImageObject.GetRasterBand(index).WriteArray(newBand)
        newImageObject.GetRasterBand(
            index).SetRasterColorInterpretation(instructionSet['color'])

    summaryStatistics = {"band": summaryArray}

    newImageObject = None
    
    cmdString = "--profile=mercator -z 3-10 \"" + tmpFile + "\" \"" + tilePath + "\""

    call(["powershell.exe", "gdal2tiles.py", cmdString])

    response.headers['Content-Type'] = 'application/json'
    response.headers['Cache-Control'] = 'no-cache'
    return json.dumps(summaryStatistics)


@route('/arithmetic_band_combination')
def arithmetic_band_combination():
    req = request.json

    # get full file paths for each band of the requested image
    bands = getFileNamesPerBandID(req['image'])

    equation = req['operations']
    newBand = img_ops.arithmeticCombination(bands, equation)

    tilePath = optPath + "userrequest/" + \
        req['image'] + ".SAFE/" + req['id'] + "/"
    os.makedirs(tilePath)

    tmpPath = optPath + "tmp/copernicloud/userrequest/"
    os.makedirs(tmpPath)
    tmpFile = tmpPath + req['id'] + ".tif"

    # read one band to get metadata, i.e. GeoTransform and Projection
    metaBand = gdal.Open(bands[0])

    newImageObject = geotiff.CreateCopy(tmpFile, metaBand, 0)
    newImageObject = geotiff.Create(
        tmpFile,
        metaBand.RasterXSize, metaBand.RasterYSize,
        1,
        gdal.GDT_UInt16)
    newImageObject.SetGeoTransform(metaBand.GetGeoTransform())
    newImageObject.SetProjection(metaBand.GetProjection())

    summaryArray = []
    summaryArray.append(img_ops.getSummaryStatistics(newBand))
    summaryStatistics = {"band": summaryArray}

    newImageObject.GetRasterBand(1).WriteArray(newBand)
    newImageObject.GetRasterBand(1).SetRasterColorInterpretation(1)

    newImageObject = None

    os.popen("gdal2tiles.py --profile=mercator -z 3-13 \"" +
              tmpFile + "\" \"" + tilePath + "\" ")
    # subprocess.call("gdal2tiles.py --profile=mercator -z 10-13 \"" + tmpFile + "\" \"" + tilePath + "\" ")

    response.headers['Content-Type'] = 'application/json'
    response.headers['Cache-Control'] = 'no-cache'
    return json.dumps(summaryStatistics)

    # res = response.__init__(body=json.dumps(summaryStatistics))
    # return res


@route('/mask_pixels')
def mask_pixels():
    return "TODO"


@route('/get_point_info')
def get_point_info():

    req = request.json
    lat, lng = req['lat'], req['lng']
    band = req['band']
    imgName = req['image']  # may differ later

    imgPath = optPath + "sentinel2/" + \
        imgName + ".SAFE/GRANULE/"
    dirName = os.listdir(imgPath)
    imgPath = imgPath + dirName[0] + "/IMG_DATA/"

    filenameParts = imgName.split("_")

    if "L1C" in filenameParts[1]:
        band = imgPath + filenameParts[5] + "_" + \
            filenameParts[2] + "_" + band + ".jp2"
    else:
        if os.path.is_file(imgPath + "R10m/L2A_" + filenameParts[5] + "_" + filenameParts[2] + "_" + band + "_10m.jp2"):
            band = imgPath + "R10m/L2A_" + \
                filenameParts[5] + "_" + filenameParts[2] + \
                "_" + band + "_10m.jp2"
        elif os.path.is_file(imgPath + "R20m/L2A_" + filenameParts[5] + "_" + filenameParts[2] + "_" + band + "_20m.jp2"):
            band = imgPath + "R20m/L2A_" + \
                filenameParts[5] + "_" + filenameParts[2] + \
                "_" + band + "_20m.jp2"
        else:
            band = imgPath + "R60m/L2A_" + \
                filenameParts[5] + "_" + filenameParts[2] + \
                "_" + band + "_60m.jp2"

    pointInfo = img_ops.getPointInfo(band, lat, lng)

    response.headers['Content-Type'] = 'application/json'
    response.headers['Cache-Control'] = 'no-cache'
    return json.dumps({"pointInfo": pointInfo})


@route('/get_summary_statistics')
def get_summary_statistics():
    req = request.json
    band = req["band"]
    imgName = req['image']  # may differ later
    imgPath = optPath + "sentinel2/" + \
        imgName + ".SAFE/GRANULE/"
    imgPath = imgPath + [x[0] for x in os.walk(imgPath)] + "/IMG_DATA/"
    filenameParts = imgName.split("_")

    if "L1C" in filenameParts[1]:
        band = imgPath + filenameParts[5] + "_" + \
            filenameParts[2] + "_" + band + ".jp2"
    else:
        if os.path.is_file(imgPath + "R10m/L2A_" + filenameParts[5] + "_" + filenameParts[2] + "_" + band + "_10m.jp2"):
            band = imgPath + "R10m/L2A_" + \
                filenameParts[5] + "_" + filenameParts[2] + \
                "_" + band + "_10m.jp2"
        elif os.path.is_file(imgPath + "R20m/L2A_" + filenameParts[5] + "_" + filenameParts[2] + "_" + band + "_20m.jp2"):
            band = imgPath + "R20m/L2A_" + \
                filenameParts[5] + "_" + filenameParts[2] + \
                "_" + band + "_20m.jp2"
        else:
            band = imgPath + "R60m/L2A_" + \
                filenameParts[5] + "_" + filenameParts[2] + \
                "_" + band + "_60m.jp2"

    img_ops.getSummaryStatistics()


run(host='localhost', port=8088)
