#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue Jan 16 22:11:22 2018

@author: timmimim
"""

import numpy as np
import os
import gdal, gdalconst, osr
from PIL import Image

float32 = np.float32
geotiff = gdal.GetDriverByName('GTiff')

#######################################
############ Edit Band ################
#######################################

def edit_band (instructions, bandPaths):
    
    band = None
    
    if  instructions['band'] == "B01"  : 
        band = gdal.Open(bandPaths[0])
        band = band.GetRasterBand(1).ReadAsArray(0,0,band.RasterXSize, band.RasterYSize)
    if  instructions['band'] == "B02"  : 
        band = gdal.Open(bandPaths[1])
        band = band.GetRasterBand(1).ReadAsArray(0,0,band.RasterXSize, band.RasterYSize)
    if  instructions['band'] == "B03"  : 
        band = gdal.Open(bandPaths[2])
        band = band.GetRasterBand(1).ReadAsArray(0,0,band.RasterXSize, band.RasterYSize)
    if  instructions['band'] == "B04"  : 
        band = gdal.Open(bandPaths[3])
        band = band.GetRasterBand(1).ReadAsArray(0,0,band.RasterXSize, band.RasterYSize)
    if  instructions['band'] == "B05"  : 
        band = gdal.Open(bandPaths[4])
        band = band.GetRasterBand(1).ReadAsArray(0,0,band.RasterXSize, band.RasterYSize)
    if  instructions['band'] == "B06"  : 
        band = gdal.Open(bandPaths[5])
        band = band.GetRasterBand(1).ReadAsArray(0,0,band.RasterXSize, band.RasterYSize)
    if  instructions['band'] == "B07"  : 
        band = gdal.Open(bandPaths[6])
        band = band.GetRasterBand(1).ReadAsArray(0,0,band.RasterXSize, band.RasterYSize)
    if  instructions['band'] == "B08"  : 
        band = gdal.Open(bandPaths[7])
        band = band.GetRasterBand(1).ReadAsArray(0,0,band.RasterXSize, band.RasterYSize)
    if  instructions['band'] == "B8A"  : 
        band = gdal.Open(bandPaths[8])
        band = band.GetRasterBand(1).ReadAsArray(0,0,band.RasterXSize, band.RasterYSize)
    if  instructions['band'] == "B09"  : 
        band = gdal.Open(bandPaths[9])
        band = band.GetRasterBand(1).ReadAsArray(0,0,band.RasterXSize, band.RasterYSize)
    if  instructions['band'] == "B10"  : 
        band = gdal.Open(bandPaths[10])
        band = band.GetRasterBand(1).ReadAsArray(0,0,band.RasterXSize, band.RasterYSize)
    if  instructions['band'] == "B11"  : 
        band = gdal.Open(bandPaths[11])
        band = band.GetRasterBand(1).ReadAsArray(0,0,band.RasterXSize, band.RasterYSize)
    if  instructions['band'] == "B12"  : 
        band = gdal.Open(bandPaths[12])
        band = band.GetRasterBand(1).ReadAsArray(0,0,band.RasterXSize, band.RasterYSize)
    
    band = change_brightness(band, instructions['brightness'])
    band = change_contrast(band, instructions['contrast'])
    
    return band

#######################################
###### Brightness Adjustment ##########
#######################################

def change_brightness(img, level):
    # create a summand (which may be negative) and scale to 16bit int
    summand = int(int(level)/255 * 65536) - (65536/2)
    
    # add summand to each pixel, thus in-/decreasing its numeric value
    brightnessAdjustedBand = np.add(img, summand)
    
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
    factor = (256 * (int(level)+255)) / (255 * (256-int(level)))

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

def arithmeticCombination (bandPaths, eq):
    # open Bands where required
    def returnSelf (val):
        return val
    
    equation = ''.join(str(e) for e in eq)

    B01 = None
    B02 = None
    B03 = None
    B04 = None
    B05 = None
    B06 = None
    B07 = None
    B08 = None
    B8A = None
    B09 = None
    B10 = None
    B11 = None
    B12 = None
    
    rasterSizes = np.array([0,0,0,0,0,0,0,0,0,0,0,0,0])
    
    if "B01" in equation : 
        B01 = gdal.Open(bandPaths[0])
        rasterSizes[0] = B01.RasterXSize
        B01 = B01.GetRasterBand(1).ReadAsArray(0,0,B01.RasterXSize, B01.RasterYSize)
    if "B02" in equation : 
        B02 = gdal.Open(bandPaths[1])
        rasterSizes[1] = B02.RasterXSize
        B02 = B02.GetRasterBand(1).ReadAsArray(0,0,B02.RasterXSize, B02.RasterYSize)
    if "B03" in equation : 
        B03 = gdal.Open(bandPaths[2])
        rasterSizes[2] = B03.RasterXSize
        B03 = B03.GetRasterBand(1).ReadAsArray(0,0,B03.RasterXSize, B03.RasterYSize)
    if "B04" in equation : 
        B04 = gdal.Open(bandPaths[3])
        rasterSizes[3] = B04.RasterXSize
        B04 = B04.GetRasterBand(1).ReadAsArray(0,0,B04.RasterXSize, B04.RasterYSize)
    if "B05" in equation : 
        B05 = gdal.Open(bandPaths[4])
        rasterSizes[4] = B05.RasterXSize
        B05 = B05.GetRasterBand(1).ReadAsArray(0,0,B05.RasterXSize, B05.RasterYSize)
    if "B06" in equation : 
        B06 = gdal.Open(bandPaths[5])
        rasterSizes[5] = B06.RasterXSize
        B06 = B06.GetRasterBand(1).ReadAsArray(0,0,B06.RasterXSize,B06.RasterYSize)
    if "B07" in equation : 
        B07 = gdal.Open(bandPaths[6])
        rasterSizes[6] = B07.RasterXSize
        B07 = B07.GetRasterBand(1).ReadAsArray(0,0,B07.RasterXSize, B07.RasterYSize)
    if "B08" in equation : 
        B08 = gdal.Open(bandPaths[7])
        rasterSizes[7] = B08.RasterXSize
        B08 = B08.GetRasterBand(1).ReadAsArray(0,0,B08.RasterXSize, B08.RasterYSize)
    if "B8A" in equation : 
        B8A = gdal.Open(bandPaths[8])
        rasterSizes[8] = B8A.RasterXSize
        B8A = B8A.GetRasterBand(1).ReadAsArray(0,0,B8A.RasterXSize, B8A.RasterYSize)
    if "B09" in equation : 
        B09 = gdal.Open(bandPaths[9])
        rasterSizes[9] = B09.RasterXSize
        B09 = B09.GetRasterBand(1).ReadAsArray(0,0,B09.RasterXSize, B09.RasterYSize)
    if "B10" in equation : 
        B10 = gdal.Open(bandPaths[10])
        rasterSizes[10] = B10.RasterXSize
        B10 = B10.GetRasterBand(1).ReadAsArray(0,0,B10.RasterXSize, B10.RasterYSize)
    if "B11" in equation : 
        B11 = gdal.Open(bandPaths[11])
        rasterSizes[11] = B11.RasterXSize
        B11 = B11.GetRasterBand(1).ReadAsArray(0,0,B11.RasterXSize, B11.RasterYSize)
    if "B12" in equation : 
        B12 = gdal.Open(bandPaths[12])
        rasterSizes[12] = B12.RasterXSize
        B12 = B12.GetRasterBand(1).ReadAsArray(0,0,B12.RasterXSize, B12.RasterYSize)
    
    maxDim = np.max(rasterSizes)
    
    for b in [B01, B02, B03, B04, B05, B06, B07, B08, B8A, B09, B10, B11, B12]:
        if b != None:
            img = Image.fromarray(b)
            img = img.resize((maxDim, maxDim))
            b = np.array(img)
    
    print("equation")
    print(equation)

    # newBand = eval(equation)
    newBand = eval(equation) 

    newBand = np.nan_to_num(newBand)
    newBand[ newBand == np.inf ] = np.max(newBand)
    
    newBand = ((newBand - np.min(newBand)) / (np.max(newBand) - np.min(newBand))) * 65536
    print(getSummaryStatistics(newBand))
    return newBand.astype(int)
    
    
    
########################################
    
#######################################
###### Get Point Information ##########
#######################################
    
def getPointInfo(bandPath, lat, lng):
    return os.popen("gdallocationinfo -valonly -wgs84 \"" + bandPath +"\" "+ lng + " " + lat).read()

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
            'mean': str(mean),
            'median': str(median),
            'max': str(maxPixel),
            'min': str(minPixel),
            'stdDev': str(stdDeviation)
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