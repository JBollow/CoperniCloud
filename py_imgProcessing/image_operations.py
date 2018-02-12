#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue Jan 16 22:11:22 2018

@author: timmimim
"""

import numpy as np
import os
from osgeo import gdal, gdalconst, osr
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
    
    # increase / decrease brightness of image pixel-wise
    band = change_brightness(band, instructions['brightness'])
    
    # increase / decrease contrase of image pixel-wise
    band = change_contrast(band, instructions['contrast'])
    
    # when masking is required, mask pixels according to requested logic operators
    if instructions['mask'] != "band":
        band = maskingHelper(band, instructions['mask'])
        
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

def arithmeticCombination (bandPaths, eq, mask):
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
    
    print(type(B01))

    if type(B01).__module__ == np.__name__:
        img = Image.fromarray(B01)
        img = img.resize((maxDim, maxDim))
        B01 = np.array(img)
    
    if type(B02).__module__ == np.__name__:
        img = Image.fromarray(B02)
        img = img.resize((maxDim, maxDim))
        B02 = np.array(img)
    
    if type(B03).__module__ == np.__name__:
        img = Image.fromarray(B03)
        img = img.resize((maxDim, maxDim))
        B03 = np.array(img)
    
    if type(B04).__module__ == np.__name__:
        img = Image.fromarray(B04)
        img = img.resize((maxDim, maxDim))
        B04 = np.array(img)
    
    if type(B05).__module__ == np.__name__:
        img = Image.fromarray(B05)
        img = img.resize((maxDim, maxDim))
        B05 = np.array(img)
    
    if type(B06).__module__ == np.__name__:
        img = Image.fromarray(B06)
        img = img.resize((maxDim, maxDim))
        B06 = np.array(img)
    
    if type(B07).__module__ == np.__name__:
        img = Image.fromarray(B07)
        img = img.resize((maxDim, maxDim))
        B07 = np.array(img)
    
    if type(B08).__module__ == np.__name__:
        img = Image.fromarray(B08)
        img = img.resize((maxDim, maxDim))
        B08 = np.array(img)
    
    if type(B8A).__module__ == np.__name__:
        img = Image.fromarray(B8A)
        img = img.resize((maxDim, maxDim))
        B8A = np.array(img)
    
    if type(B09).__module__ == np.__name__:
        img = Image.fromarray(B09)
        img = img.resize((maxDim, maxDim))
        B09 = np.array(img)
    
    if type(B10).__module__ == np.__name__:
        img = Image.fromarray(B10)
        img = img.resize((maxDim, maxDim))
        B10 = np.array(img)
    
    if type(B11).__module__ == np.__name__:
        img = Image.fromarray(B11)
        img = img.resize((maxDim, maxDim))
        B11 = np.array(img)
        
    if type(B12).__module__ == np.__name__:
        img = Image.fromarray(B12)
        img = img.resize((maxDim, maxDim))
        B12 = np.array(img)
        
    print("equation")
    print(equation)

    # newBand = eval(equation)
    newBand = eval(equation) 

    newBand = np.nan_to_num(newBand)
    newBand[ newBand == np.inf ] = np.max(newBand)
    
    newBand = ((newBand - np.min(newBand)) / (np.max(newBand) - np.min(newBand))) * 65536
    
    if mask != "band":
        newBand = maskingHelper(newBand, mask)
    
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

def maskPixels (imgBand, logicOp, invert=True):
    # ops is an array of Stings following format:
    # "band [logical_op] [0 <= int_value <= 255]"
    # or
    # "[0 <= int_value <= 255] [logical_op] band"

    # @invert : this parameter controls whether the boolean nparray created from
    #           our logical expression shall be inverted (i.e. mask every value where the expression holds true)
    #           or not (for example:  band <= 5  --> invert=True  == black out all pixels with value <= 5;
    #                                                invert=False == black out all pixels with value > 5 )

    # normalize imgBand and scale to uint8
    band = (imgBand / 65535) * 255
    band = band.astype(int)
    
    bandMasked = band
    
    mask = eval(logicOp)
    if not invert:
        mask = np.logical_not(mask)
    
    mask = mask.astype(int)
    
    bandMasked = bandMasked * mask
    
    # normalize bandMasked and scale back to uint16
    bandMasked = (bandMasked / 255) * 65535
    bandMasked = bandMasked.astype(int)
    
    return bandMasked

##########################################
#
# Helper Wrapper for masking pixels:
#   catch eventuality of interval masking
#   e.g. x <= band <= y
    
def maskingHelper (band, logicalMask):
    if "<=band<=" in logicalMask or ">=band>=" in logicalMask: 
        
        logicals = logicalMask.split("band")
        
        logic1 = logicals[0] + "band"
        logic2 = "band" + logicals[1]
        
        if "<=band<=" in logicalMask: 
            
            margins = logicalMask.split("<=band<=")
            
            if int(margins[0]) <= int(margins[1]):
                # mask everything between the two int values
                # to do so, create 2 parts, one with only values above the bigger, one with only below the lower
                # then add them back up
                maskPart1 = maskPixels (band, logic2)
                maskPart2 = maskPixels (band, logic1, invert=False)
                return maskPart1 + maskPart2
            
            else:     
                # mask everything above and below the int values
                maskPart1 = maskPixels (band, logic2, invert=False)
                return maskPixels (maskPart1, logic1)
            
        else: 
            margins = logicalMask.split(">=band>=")
        
            if int(margins[0]) <= int(margins[1]):
                maskPart1 = maskPixels (band, logic1, invert=False)
                return maskPixels (maskPart1, logic2)
                
            else:     
                # mask everything between the two int values
                # to do so, create 2 parts, one with only values above the bigger, one with only below the lower
                # then add them back up
                maskPart1 = maskPixels (band, logic1)
                maskPart2 = maskPixels (band, logic2, invert=False)
                return maskPart1 + maskPart2      
        
    else: 
        # only singular logical mask, basic request
        return maskPixels (band, logicalMask)

##########################################
