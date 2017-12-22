#!/bin/bash
cd /opt/sentinel2
for folderd in */; do
    mkdir /opt/tiles/"$folderd"
    cd /opt/sentinel2/"$folderd"GRANULE
    for sfolder in */; do
        cd ./"$sfolder"/IMG_DATA
        for file in ./*.jp2; do
            sfile="${file%.*}"
            gdal2tiles.py --profile=mercator -z 3-13 ./"${file##*/}" /opt/tiles/"$folderd"/"${sfile: -3}"/ &
        done
    done
done