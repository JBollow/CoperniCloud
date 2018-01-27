#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue Jan 16 22:03:38 2018

@author: timmimim
"""        

from bottle import route, run, template, request, response
import numpy as np
import image_operations as  img_ops 
import os
from subprocess import Popen
import gdal, gdalconst, osr
import json

float32 = np.float32
geotiff = gdal.GetDriverByName('GTiff')

@route('/')
@route('/sth')
def meta(x='NA'):
    return '<b>This is a simple python server, set up using the Bottle framework.</b>'


@route('/hello/<name>')
def index(name):
    return template('<b>Hello {{name}}! {{doShizzles}}</b>!', name=name, doShizzles=img_ops.doShizzles(name))


@route('/create_new_image')
def create_new_image():
    
    req = request.json
    
    tilePath = "/opt/userrequest/" + req.image + "/" +req.ID + "/"
    os.makedirs(tilePath)
    
    tmpPath = "/tmp/copernicloud/userrequest/"
    os.makedirs(tmpPath)
    
    tmpFile = tmpPath + req.ID + ".tif"
    
    # get full file paths for each band of the requested image
    bandFileNames = getFileNamesPerBandID(req.image)
    #read one band to get metadata, i.e. GeoTransform and Projection
    metaBand = gdal.Open(bandFileNames[0])
    
    newImageObject = geotiff.CreateCopy(tmpFile, metaBand, 0)
    newImageObject = geotiff.Create(
            tmpFile, 
            metaBand.RasterXSize, metaBand.RasterYSize,
            len(req.operations),
            gdal.GDT_UInt16)
    newImageObject.SetGeoTransform(metaBand.GetGeoTransform())
    newImageObject.SetProjection(metaBand.GetProjection())
           
    bandBuildInstructions = None
    for i, instructionSet in enumerate(req.operations, start=0):
        bandBuildInstructions[i] = makeColorInterpretationSettingNumeric(instructionSet)
    
    summaryStatistics = {}
    
    for index, instructionSet in enumerate(bandBuildInstructions, start=1):
        newBand = img_ops.editBand(instructionSet, bandFileNames)
        
        summaryStatistics[str(index)] = img_ops.getSummaryStatistics(newBand)
        
        newImageObject.GetRasterBand(index).WriteArray(newBand)
        newImageObject.GetRasterBand(index).SetRasterColorInterpretation(instructionSet.color)
    
    newImageObject = None
    
    os.system("gdal2tiles.py --profile=mercator -z 3-9 " + tmpFile + " " + tilePath)
    p = Popen("gdal2tiles.py --profile=mercator -z 10-13 " + tmpFile + " " + tilePath)
    
    res = response.__init__(body=json.dumps(summaryStatistics))
    return res

@route('/arithmetic_band_combination')
def arithmetic_band_combination():
    req = request.json
    
    # get full file paths for each band of the requested image    
    bands = getFileNamesPerBandID(req.image)
    
    equation = req.operations
    newBand = img_ops.arithmeticCombination(bands, equation)
    
    tilePath = "/opt/userrequest/" + req.image + "/" + req.ID + "/"
    os.makedirs(tilePath)
    
    tmpPath = "/tmp/copernicloud/userrequest/"
    os.makedirs(tmpPath)
    tmpFile = tmpPath + req.ID + ".tif"
    
    
    
    #read one band to get metadata, i.e. GeoTransform and Projection
    metaBand = gdal.Open(bands[0])
    
    newImageObject = geotiff.CreateCopy(tmpFile, metaBand, 0)
    newImageObject = geotiff.Create(
            tmpFile, 
            metaBand.RasterXSize, metaBand.RasterYSize,
            1,
            gdal.GDT_UInt16)
    newImageObject.SetGeoTransform(metaBand.GetGeoTransform())
    newImageObject.SetProjection(metaBand.GetProjection())
    
    summaryStatistics = {
            '1': img_ops.getSummaryStatistics(newBand)
            } 
        
    newImageObject.GetRasterBand(1).WriteArray(newBand)
    newImageObject.GetRasterBand(1).SetRasterColorInterpretation(1)
    
    newImageObject = None
    
    os.system("gdal2tiles.py --profile=mercator -z 3-9 " + tmpFile + " " + tilePath)
    
    p = Popen("gdal2tiles.py --profile=mercator -z 10-13 " + tmpFile + " " + tilePath)
    
    res = response.__init__(body=json.dumps(summaryStatistics))
    return res


@route('/mask_pixels')
def mask_pixels():
    return "TODO"


@route('/get_point_info')
def get_point_info():
    req = request.json
    lat, lng = req.lat, req.lng
    band = req.band
    imgName = req.image # may differ later
    
    imgPath = "/opt/sentinel2/" + imgName + "/GRANULE/*/IMG_DATA/"
    filenameParts = imgName.split("_")

    if "L1C" in filenameParts[1]:
        band = imgPath + filenameParts[5] + "_" + filenameParts[2] + "_" + band + ".jp2" 
    else :
        if os.path.is_file(imgPath + "R10m/L2A_" + filenameParts[5] + "_" + filenameParts[2] + "_" + band + "_10m.jp2"):
            band = imgPath + "R10m/L2A_" + filenameParts[5] + "_" + filenameParts[2] + "_" + band + "_10m.jp2"
        elif os.path.is_file(imgPath + "R20m/L2A_" + filenameParts[5] + "_" + filenameParts[2] + "_" + band + "_20m.jp2"):
            band = imgPath + "R20m/L2A_" + filenameParts[5] + "_" + filenameParts[2] + "_" + band + "_20m.jp2"
        else: 
            band = imgPath + "R60m/L2A_" + filenameParts[5] + "_" + filenameParts[2] + "_" + band + "_60m.jp2"
    
    pointInfo = img_ops.getPointInfo(band, lat, lng)
        
    return response.__init__(body=str(pointInfo))

@route('/get_summary_statistics')
def get_summary_statistics():
    req = request.json
    band = req.band
    imgName = req.image # may differ later
    
    imgPath = "/opt/sentinel2/" + imgName + "/GRANULE/*/IMG_DATA/"
    filenameParts = imgName.split("_")

    if "L1C" in filenameParts[1]:
        band = imgPath + filenameParts[5] + "_" + filenameParts[2] + "_" + band + ".jp2" 
    else :
        if os.path.is_file(imgPath + "R10m/L2A_" + filenameParts[5] + "_" + filenameParts[2] + "_" + band + "_10m.jp2"):
            band = imgPath + "R10m/L2A_" + filenameParts[5] + "_" + filenameParts[2] + "_" + band + "_10m.jp2"
        elif os.path.is_file(imgPath + "R20m/L2A_" + filenameParts[5] + "_" + filenameParts[2] + "_" + band + "_20m.jp2"):
            band = imgPath + "R20m/L2A_" + filenameParts[5] + "_" + filenameParts[2] + "_" + band + "_20m.jp2"
        else: 
            band = imgPath + "R60m/L2A_" + filenameParts[5] + "_" + filenameParts[2] + "_" + band + "_60m.jp2"
    
    img_ops.getSummaryStatistics()

run(host='localhost', port=8080)

# helper functions to handle Band- and Image requests

# convert incoming band IDs to band file names
def getFileNamesPerBandID (imgName):
    
    imgPath = "/opt/sentinel2/" + imgName + "/GRANULE/*/IMG_DATA/"
    
    filenameParts = imgName.split("_")
    
    bandFileNames = [None]*13
    
    # helper functions for building band file paths
    def concatenateFileName_2A (bandID):
        if os.path.is_file(imgPath + "R10m/L2A_" + filenameParts[5] + "_" + filenameParts[2] + "_" + bandID + "_10m.jp2"):
            return imgPath + "R10m/L2A_" + filenameParts[5] + "_" + filenameParts[2] + "_" + bandID + "_10m.jp2"
        elif os.path.is_file(imgPath + "R20m/L2A_" + filenameParts[5] + "_" + filenameParts[2] + "_" + bandID + "_20m.jp2"):
            return imgPath + "R20m/L2A_" + filenameParts[5] + "_" + filenameParts[2] + "_" + bandID + "_20m.jp2"
        else: 
            return imgPath + "R60m/L2A_" + filenameParts[5] + "_" + filenameParts[2] + "_" + bandID + "_60m.jp2"
    
    
    def concatenateFileName_1C (bandID):    
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
    else :
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
    if instructionSet.color == "grayscale": instructionSet.color = 1
    if instructionSet.color == "palette": instructionSet.color = 2
    if instructionSet.color == "red": instructionSet.color = 3
    if instructionSet.color == "green": instructionSet.color = 4
    if instructionSet.color == "blue": instructionSet.color = 5
    if instructionSet.color == "alpha": instructionSet.color = 6
    return instructionSet

#print(bandIDsToFileNames("S2B_MSIL1C_20171010T163309_N0205_R083_T15QYF_20171010T164025.SAFE"))

    
# =============================================================================
#     someJSON = json.dumps([{'attribute': 'value'}, {'fuck': ['off', 'a duck']}], separators=(',',':'))
#     print(someJSON)
#     print(json.dumps(someJSON, sort_keys=True, indent=4, separators=(',',':')))
#     return someJSON
# =============================================================================