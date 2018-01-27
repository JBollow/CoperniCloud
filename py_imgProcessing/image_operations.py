#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue Jan 16 22:11:22 2018

@author: timmimim
"""

import numpy as np
from sys import argv
import os
import gdal, gdalconst, osr
import json


float32 = np.float32
geotiff = gdal.GetDriverByName('GTiff')

#### !!!!!
#### Output directory ist Request ID
#### /opt/userRequest/[ObjectID]/   mit GDAL2Tiles
#### gdal2tiles aus OS aufrufen, nicht trivial aus script ohne os.system()

#### response beinhaltet Summary Statistics !!! 
#### generieren bei // vor Speicherung als JSON-Objekt

#### NDVI ist genau 1 Band, daraus direkt TMS, summary statistics

#### zoom level 3-9 synchron, dann response DONE incl summary
#### zoom 10-12 asychron, egal wann fertig. 

#######################################
############ Edit Band ################
#######################################

def edit_band (instructions, bandPaths):
    
    band = None
    
    if  instructions.band == "B01"  : band = gdal.Open(bandPaths[0])
    if  instructions.band == "B02"  : band = gdal.Open(bandPaths[1])
    if  instructions.band == "B03"  : band = gdal.Open(bandPaths[2])
    if  instructions.band == "B04"  : band = gdal.Open(bandPaths[3])
    if  instructions.band == "B05"  : band = gdal.Open(bandPaths[4])
    if  instructions.band == "B06"  : band = gdal.Open(bandPaths[5])
    if  instructions.band == "B07"  : band = gdal.Open(bandPaths[6])
    if  instructions.band == "B08"  : band = gdal.Open(bandPaths[7])
    if  instructions.band == "B8A"  : band = gdal.Open(bandPaths[8])
    if  instructions.band == "B09"  : band = gdal.Open(bandPaths[9])
    if  instructions.band == "B10"  : band = gdal.Open(bandPaths[10])
    if  instructions.band == "B11"  : band = gdal.Open(bandPaths[11])
    if  instructions.band == "B12"  : band = gdal.Open(bandPaths[12])
    
    band = change_brightness(band, instructions.brightness)
    band = change_contrast(band, instructions.constrast)
    
    return band

#######################################
###### Brightness Adjustment ##########
#######################################

def change_brightness(img, level):
    # create a summand (which may be negative) and scale to 16bit int
    summand = int(level/255 * 65536) - (65536/2)
    
    # add summand to each pixel, thus in-/decreasing its numeric value
    brightnessAdjustedBand = img + summand
    
    # establish minimum and maximum values for black and white at 0 -- 65536 using logical ops for each pixel
    brightnessAdjustedBand[ brightnessAdjustedBand<0 ]= 0
    brightnessAdjustedBand[ brightnessAdjustedBand>65536 ]= 65536
    
    return brightnessAdjustedBand
    

#######################################
###### Constrast Adjustment ###########
#######################################

# img must be a 16bit numpy matrix
# level must be a numeric value between 0 - 255  [level may be double to crank up contrast to a maximum, i.e. total black and white]
def change_contrast(img, level):
    
    # create a factor by which to adjust each pixel
    factor = (256 * (level+255)) / (255 * (256-level))

    # calculate new contrast adjusted band from original image
    contrastAdjustedBand = factor * (img-np.mean(img)) + np.mean(img)
    
    # typecast image array to int (image needs uint16 values)
    contrastAdjustedBand = contrastAdjustedBand.astype(int)
    
    # establish minimum and maximum values for black and white at 0 -- 65536 using logical ops for each pixel
    contrastAdjustedBand[ contrastAdjustedBand<0 ]= 0
    contrastAdjustedBand[ contrastAdjustedBand>65536 ]= 65536
    
    return contrastAdjustedBand
# end
    


######################################### 
    

#######################################
###### Arithmetic Combination #########
#######################################

def arithmeticCombination (bandPaths, equation):
    # open Bands where required
    def returnSelf (val):
        return val
    
    B01,B02,B03,B04,B05,B06,B07,B08,B8A,B09,B10,B11,B12 = None
    
    if "B01" in equation : B01 = gdal.Open(bandPaths[0])
    if "B02" in equation : B02 = gdal.Open(bandPaths[1])
    if "B03" in equation : B03 = gdal.Open(bandPaths[2])
    if "B04" in equation : B04 = gdal.Open(bandPaths[3])
    if "B05" in equation : B05 = gdal.Open(bandPaths[4])
    if "B06" in equation : B06 = gdal.Open(bandPaths[5])
    if "B07" in equation : B07 = gdal.Open(bandPaths[6])
    if "B08" in equation : B08 = gdal.Open(bandPaths[7])
    if "B8A" in equation : B8A = gdal.Open(bandPaths[8])
    if "B09" in equation : B09 = gdal.Open(bandPaths[9])
    if "B10" in equation : B10 = gdal.Open(bandPaths[10])
    if "B11" in equation : B11 = gdal.Open(bandPaths[11])
    if "B12" in equation : B12 = gdal.Open(bandPaths[12])
    
    newBand = eval(equation)
    newBand = np.nan_to_num(newBand)
    newBand[ newBand == np.inf ] = np.max(newBand)
    
    newBand = ((newBand - np.min(newBand)) / (np.max(newBand) - np.min(newBand))) * 65536
    
    return newBand.asType(int)
    
    
########################################
    
#######################################
###### Get Point Information ##########
#######################################
    
def getPointInfo(bandPath, lat, lng):
    return os.system('gdallocationinfo -valonly -wgs84 %s %s %s' % (bandPath, lng, lat))


#########################################
        
#######################################
######## Summary Statistics ###########
#######################################

def getSummaryStatistics(band):
    mean = np.mean(band)
    median = np.median(band)
    maxPixel = np.max(band)
    minPixel = np.min(band)
    stdDeviation = np.std(band, ddof=1)
    
    statistics = {
            'mean': mean,
            'median': median,
            'max': maxPixel,
            'min': minPixel,
            'stdDev': stdDeviation
            }
    
    return statistics


########################################
    

#######################################
########## Masking Pixels #############
#######################################

def maskPixels (imgBand, logicOp):
    # ops is an array of Stings following format:
    # "band [logical_op] [0 <= int_value <= 65536]
    
    band = imgBand
    band += 1
    
    band[eval(logicOp)] = 0
    
    return band


##########################################


# band variables; maybe baby!?
# red, nir = map(gdal.Open, argv[1:3])

def doShizzles(x):
    theShizzles = '<small>The shizzles be wack, yo. Believe that, %s!!</small>' % (x)
    return theShizzles